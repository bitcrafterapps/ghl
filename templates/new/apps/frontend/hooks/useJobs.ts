'use client';

import { useState, useCallback } from 'react';
import type {
  Job,
  CreateJobDTO,
  UpdateJobDTO,
  JobFilters,
  JobActivity,
  JobStatus,
  KanbanColumn,
} from '@/types/jobs';
import type { PaginationParams, PaginatedResponse } from '@/types/contacts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface UseJobsOptions {
  initialFilters?: JobFilters;
  initialPagination?: PaginationParams;
}

interface JobsState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

interface JobsActions {
  fetchJobs: (filters?: JobFilters, pagination?: PaginationParams) => Promise<void>;
  fetchKanban: () => Promise<KanbanColumn[]>;
  getJob: (id: string) => Promise<Job | null>;
  createJob: (data: CreateJobDTO) => Promise<Job | null>;
  updateJob: (id: string, data: UpdateJobDTO) => Promise<Job | null>;
  updateJobStatus: (id: string, status: JobStatus) => Promise<Job | null>;
  deleteJob: (id: string) => Promise<boolean>;
  getActivities: (jobId: string) => Promise<JobActivity[]>;
  addActivity: (jobId: string, data: Partial<JobActivity>) => Promise<JobActivity | null>;
  setFilters: (filters: JobFilters) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export function useJobs(options: UseJobsOptions = {}): JobsState & JobsActions {
  const [state, setState] = useState<JobsState>({
    jobs: [],
    loading: false,
    error: null,
    pagination: null,
  });

  const [filters, setFilters] = useState<JobFilters>(options.initialFilters || {});
  const [paginationParams, setPaginationParams] = useState<PaginationParams>(
    options.initialPagination || { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }
  );

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const buildQueryString = useCallback((filters: JobFilters, pagination: PaginationParams): string => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      statuses.forEach(s => params.append('status', s));
    }
    if (filters.priority) {
      const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority];
      priorities.forEach(p => params.append('priority', p));
    }
    if (filters.contactId) params.append('contactId', filters.contactId);
    if (filters.assignedUserId) params.append('assignedUserId', String(filters.assignedUserId));
    if (filters.serviceType) params.append('serviceType', filters.serviceType);
    if (filters.scheduledDateStart) params.append('scheduledDateStart', filters.scheduledDateStart);
    if (filters.scheduledDateEnd) params.append('scheduledDateEnd', filters.scheduledDateEnd);
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
    
    if (pagination.page) params.append('page', String(pagination.page));
    if (pagination.limit) params.append('limit', String(pagination.limit));
    if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
    
    return params.toString();
  }, []);

  const fetchJobs = useCallback(async (
    newFilters?: JobFilters,
    newPagination?: PaginationParams
  ): Promise<void> => {
    const currentFilters = newFilters || filters;
    const currentPagination = newPagination || paginationParams;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const queryString = buildQueryString(currentFilters, currentPagination);
      const response = await fetch(`${API_BASE}/api/v1/jobs?${queryString}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch jobs');
      }
      
      const result = await response.json();
      const data = result.data as PaginatedResponse<Job>;
      
      setState(prev => ({
        ...prev,
        jobs: data.data,
        pagination: data.pagination,
        loading: false,
      }));
      
      if (newFilters) setFilters(newFilters);
      if (newPagination) setPaginationParams(newPagination);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [filters, paginationParams, buildQueryString, getAuthHeaders]);

  const fetchKanban = useCallback(async (): Promise<KanbanColumn[]> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/jobs/kanban`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch kanban view');
      }
      
      const result = await response.json();
      return (Array.isArray(result.data) ? result.data : []) as KanbanColumn[];
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to fetch kanban',
      }));
      return [];
    }
  }, [getAuthHeaders]);

  const getJob = useCallback(async (id: string): Promise<Job | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/jobs/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return null;
      }
      
      const result = await response.json();
      return result.data as Job;
    } catch (error) {
      return null;
    }
  }, [getAuthHeaders]);

  const createJob = useCallback(async (data: CreateJobDTO): Promise<Job | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/jobs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create job');
      }
      
      const result = await response.json();
      const newJob = result.data as Job;
      
      await fetchJobs();
      
      return newJob;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create job',
      }));
      return null;
    }
  }, [getAuthHeaders, fetchJobs]);

  const updateJob = useCallback(async (id: string, data: UpdateJobDTO): Promise<Job | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/jobs/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update job');
      }
      
      const result = await response.json();
      const updatedJob = result.data as Job;
      
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => j.id === id ? updatedJob : j),
      }));
      
      return updatedJob;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update job',
      }));
      return null;
    }
  }, [getAuthHeaders]);

  const updateJobStatus = useCallback(async (id: string, status: JobStatus): Promise<Job | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/jobs/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update job status');
      }
      
      const result = await response.json();
      const updatedJob = result.data as Job;
      
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => j.id === id ? updatedJob : j),
      }));
      
      return updatedJob;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update status',
      }));
      return null;
    }
  }, [getAuthHeaders]);

  const deleteJob = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/jobs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return false;
      }
      
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.filter(j => j.id !== id),
        pagination: prev.pagination 
          ? { ...prev.pagination, total: prev.pagination.total - 1 }
          : null,
      }));
      
      return true;
    } catch (error) {
      return false;
    }
  }, [getAuthHeaders]);

  const getActivities = useCallback(async (jobId: string): Promise<JobActivity[]> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/activities`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return [];
      }
      
      const result = await response.json();
      return result.data as JobActivity[];
    } catch (error) {
      return [];
    }
  }, [getAuthHeaders]);

  const addActivity = useCallback(async (
    jobId: string,
    data: Partial<JobActivity>
  ): Promise<JobActivity | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/activities`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        return null;
      }
      
      const result = await response.json();
      return result.data as JobActivity;
    } catch (error) {
      return null;
    }
  }, [getAuthHeaders]);

  const setPage = useCallback((page: number) => {
    const newPagination = { ...paginationParams, page };
    setPaginationParams(newPagination);
    fetchJobs(filters, newPagination);
  }, [paginationParams, filters, fetchJobs]);

  const handleSetFilters = useCallback((newFilters: JobFilters) => {
    setFilters(newFilters);
    fetchJobs(newFilters, { ...paginationParams, page: 1 });
  }, [paginationParams, fetchJobs]);

  const refresh = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  return {
    ...state,
    fetchJobs,
    fetchKanban,
    getJob,
    createJob,
    updateJob,
    updateJobStatus,
    deleteJob,
    getActivities,
    addActivity,
    setFilters: handleSetFilters,
    setPage,
    refresh,
  };
}
