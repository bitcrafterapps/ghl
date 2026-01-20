import { getApiUrl } from './api';

const API_URL = getApiUrl();

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Try auth-storage first (zustand), then fall back to token (platform)
    const storage = localStorage.getItem('auth-storage');
    if (storage) {
      const parsed = JSON.parse(storage);
      return parsed.state?.token || null;
    }
    return localStorage.getItem('token');
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = options.token || this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
        // Backend returns { success: false, error: { code, message } }
        const errorMessage = errorData.error?.message || errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 120 seconds');
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const builderApi = new ApiClient(API_URL);

// Projects API functions
// Note: Backend wraps responses in { success: true, data: {...} }, so we need to extract from .data
export const projectsApi = {
  list: async (page = 1, limit = 10, status?: string, scope?: 'personal' | 'team' | 'all') => {
    let url = `/api/v1/projects?page=${page}&limit=${limit}`;
    if (status && status !== 'All') {
      url += `&status=${status}`;
    }
    if (scope && scope !== 'all') {
      url += `&scope=${scope}`;
    }
    const response = await builderApi.get<{ 
      success: boolean; 
      data: { 
        data: any[]; 
        total: number; 
        hasMore: boolean;
        statusCounts?: { Active: number; Inactive: number; Archived: number };
        userCompanyId?: number | null;
      } 
    }>(url);
    return response.data;
  },

  get: async (id: string) => {
    const response = await builderApi.get<{ success: boolean; data: { project: any } }>(`/api/v1/projects/${id}`);
    return response.data;
  },

  create: async (data: { name: string; description?: string; techStack?: string[]; hostingPreference?: string; companyId?: number }) => {
    const response = await builderApi.post<{ success: boolean; data: { project: any } }>('/api/v1/projects', data);
    return response.data;
  },

  update: async (id: string, data: Partial<{ name: string; description: string; status: string; companyId: number | null }>) => {
    const response = await builderApi.patch<{ success: boolean; data: { project: any } }>(`/api/v1/projects/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: 'Active' | 'Inactive' | 'Archived') => {
    const response = await builderApi.patch<{ success: boolean; data: { project: any } }>(`/api/v1/projects/${id}/status`, { status });
    return response.data;
  },

  transfer: async (id: string, newOwnerId: number) => {
    const response = await builderApi.patch<{ success: boolean; data: { project: any } }>(`/api/v1/projects/${id}/transfer`, { newOwnerId });
    return response.data;
  },

  delete: (id: string) => builderApi.delete(`/api/v1/projects/${id}`),
};

// Generations API functions
// Note: Backend wraps responses in { success: true, data: {...} }, so we need to extract from .data
export const generationsApi = {
  generate: async (projectId: string, data: { prompt?: string; prdId?: string; files?: any[] }) => {
    const response = await builderApi.post<{ success: boolean; data: { generationId: string; message: string } }>(
      `/api/v1/generations/projects/${projectId}/generate`,
      data
    );
    return response.data;
  },

  list: async (projectId: string, limit = 1) => {
    const response = await builderApi.get<{ success: boolean; data: { generations: any[] } }>(`/api/v1/generations/projects/${projectId}/generations?limit=${limit}`);
    return response.data;
  },
    
  get: async (id: string) => {
    const response = await builderApi.get<{ success: boolean; data: { generation: any } }>(`/api/v1/generations/${id}`);
    return response.data;
  },

  /**
   * Fix a runtime error in a specific file using LLM
   */
  fixError: async (projectId: string, errorContext: {
    errorMessage: string;
    filePath: string;
    fileContent: string;
    lineNumber?: number;
    columnNumber?: number;
    stackTrace?: string;
    allFiles?: Array<{ path: string; content: string }>;
  }): Promise<{ fixedContent: string; explanation?: string; filePath: string }> => {
    const response = await builderApi.post<{ 
      success: boolean; 
      data: { fixedContent: string; explanation?: string; filePath: string } 
    }>(`/api/v1/generations/projects/${projectId}/fix-error`, errorContext);
    return response.data;
  },

  /**
   * Make focused modifications to existing code without full regeneration
   */
  modify: async (projectId: string, request: {
    prompt: string;
    targetFiles?: Array<{ path: string; content: string }>;
    allFiles: Array<{ path: string; content: string }>;
    intent?: 'fix' | 'enhance' | 'add_feature' | 'style_change' | 'refactor';
    chatHistory?: string;
  }): Promise<{ 
    modifiedFiles: Array<{ path: string; content: string; action: 'modify' | 'create' | 'delete' }>; 
    explanation: string;
    intent: string;
  }> => {
    const response = await builderApi.post<{ 
      success: boolean; 
      data: { 
        modifiedFiles: Array<{ path: string; content: string; action: 'modify' | 'create' | 'delete' }>; 
        explanation: string;
        intent: string;
      } 
    }>(`/api/v1/generations/projects/${projectId}/modify`, request);
    return response.data;
  },

  /**
   * Implement a single feature from the PRD without full regeneration
   */
  implementFeature: async (projectId: string, request: {
    prdId: string;
    featureId: string;
    feature: {
      name: string;
      description: string;
      acceptanceCriteria: Array<string | { text: string; completed?: boolean }>;
      priority: string;
    };
    existingFiles: Array<{ path: string; content: string }>;
  }): Promise<{
    modifiedFiles: Array<{ path: string; content: string; action: 'modify' | 'create' | 'delete' }>;
    explanation: string;
  }> => {
    const response = await builderApi.post<{
      success: boolean;
      data: {
        modifiedFiles: Array<{ path: string; content: string; action: 'modify' | 'create' | 'delete' }>;
        explanation: string;
      }
    }>(`/api/v1/generations/projects/${projectId}/implement-feature`, request);
    return response.data;
  },
};

// PRD API functions
// Note: Backend wraps responses in { success: true, data: {...} }, so we need to extract from .data
export const prdApi = {
  create: async (projectId: string) => {
    const response = await builderApi.post<{ success: boolean; data: { prd: any } }>(`/api/v1/prds/projects/${projectId}/prds`);
    return response.data;
  },

  get: async (prdId: string) => {
    const response = await builderApi.get<{ success: boolean; data: { prd: any } }>(`/api/v1/prds/${prdId}`);
    return response.data;
  },

  startInterview: async (prdId: string, initialContext?: string) => {
    const response = await builderApi.post<{ success: boolean; data: { question: string; phase: string; progress: number; context?: string; suggestions?: string[]; isComplete?: boolean; prd?: any } }>(`/api/v1/prds/${prdId}/interview/start`, { initialContext });
    return response.data;
  },

  submitAnswer: async (prdId: string, answer: string) => {
    const response = await builderApi.post<{ success: boolean; data: { question: string; phase: string; progress: number; context?: string; suggestions?: string[]; isComplete?: boolean; prd?: any } }>(`/api/v1/prds/${prdId}/interview/answer`, { answer });
    return response.data;
  },

  generateFromDescription: async (prdId: string, description: string) => {
    const response = await builderApi.post<{ success: boolean; data: { prd: any } }>(`/api/v1/prds/${prdId}/generate`, { description });
    return response.data;
  },

  chat: async (prdId: string, message: string) => {
    const response = await builderApi.post<{ success: boolean; data: { response: string; updates?: any[]; updatedPRD?: any } }>(`/api/v1/prds/${prdId}/chat`, { message });
    return response.data;
  },

  approve: async (prdId: string) => {
    const response = await builderApi.post<{ success: boolean; data: { prd: any } }>(`/api/v1/prds/${prdId}/approve`);
    return response.data;
  },

  updateSection: async (prdId: string, sectionId: string, content: any) => {
    const response = await builderApi.patch<{ success: boolean; data: { prd: any } }>(`/api/v1/prds/${prdId}/sections/${sectionId}`, { content });
    return response.data;
  },
};

// Messages API
export interface ChatMessage {
  id: string;
  projectId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  metadata?: {
    files?: Array<{ name: string; path: string }>;
    generationId?: string;
  };
  createdAt: string;
}

export const messagesApi = {
  async getMessages(projectId: string): Promise<ChatMessage[]> {
    const response = await builderApi.get<{ success: boolean; data: { messages: ChatMessage[] } }>(`/api/v1/messages/projects/${projectId}/messages`);
    return response.data.messages;
  },

  async createMessage(
    projectId: string,
    role: 'USER' | 'ASSISTANT',
    content: string,
    metadata?: any
  ): Promise<ChatMessage> {
    const response = await builderApi.post<{ success: boolean; data: { message: ChatMessage } }>(
      `/api/v1/messages/projects/${projectId}/messages`,
      { role, content, metadata }
    );
    return response.data.message;
  },
};
