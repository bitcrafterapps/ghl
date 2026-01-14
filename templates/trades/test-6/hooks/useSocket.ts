'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getApiUrl } from '@/lib/api';
import { generationsApi } from '@/lib/builder-api';

const SOCKET_URL = getApiUrl();

interface GenerationPhase {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  message?: string;
  files?: string[];
}

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface UseSocketOptions {
  projectId?: string;
  onGenerationStart?: (data: { generationId: string }) => void;
  onGenerationProgress?: (data: { generationId: string; phase: GenerationPhase }) => void;
  onGenerationComplete?: (data: { generationId: string; files: GeneratedFile[]; spec: any }) => void;
  onGenerationError?: (data: { generationId: string; error: string }) => void;
  onGenerationLog?: (data: { generationId: string; message: string }) => void;
  onNotification?: (notification: any) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Get token directly from localStorage since login page doesn't use zustand store
  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    // Try auth-storage (zustand persist) first, then fall back to direct token
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.token) return parsed.state.token;
      } catch (e) {}
    }
    return localStorage.getItem('token');
  }, []);

  const [token, setToken] = useState<string | null>(null);
  
  // Check for token on mount and periodically
  useEffect(() => {
    const checkToken = () => {
      const currentToken = getToken();
      if (currentToken !== token) {
        setToken(currentToken);
      }
    };
    
    checkToken();
    // Check periodically in case user just logged in
    const interval = setInterval(checkToken, 1000);
    return () => clearInterval(interval);
  }, [getToken, token]);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    // Generation events
    newSocket.on('generation:start', options.onGenerationStart || (() => {}));
    newSocket.on('generation:progress', options.onGenerationProgress || (() => {}));
    newSocket.on('generation:complete', options.onGenerationComplete || (() => {}));
    newSocket.on('generation:error', options.onGenerationError || (() => {}));
    newSocket.on('generation:log', options.onGenerationLog || (() => {}));
    
    // Notification events
    newSocket.on('notification:new', options.onNotification || (() => {}));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  // Join/leave project room
  useEffect(() => {
    if (socket && options.projectId) {
      socket.emit('join:project', options.projectId);
      return () => {
        socket.emit('leave:project', options.projectId);
      };
    }
  }, [socket, options.projectId]);

  return { socket, isConnected };
}

// Helper function to infer language from file path
const inferLanguageFromPath = (filePath: string): string => {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const languageMap: Record<string, string> = {
    'tsx': 'typescript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'js': 'javascript',
    'css': 'css',
    'html': 'html',
    'json': 'json',
    'prisma': 'prisma',
    'md': 'markdown',
  };
  return languageMap[ext] || 'text';
};

// Transform DB fileChanges format to GeneratedFile format
const transformFileChanges = (fileChanges: any[]): GeneratedFile[] => {
  if (!Array.isArray(fileChanges)) return [];
  return fileChanges.map((file: any) => ({
    path: file.path,
    content: file.content,
    language: file.language || inferLanguageFromPath(file.path),
  }));
};

export function useGeneration(projectId: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<GenerationPhase | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  // Fetch latest generation on mount
  useEffect(() => {
    if (!projectId) return;

    const fetchLatest = async () => {
      try {
        const { generations } = await generationsApi.list(projectId, 5);
        
        if (generations && generations.length > 0) {
          // Find the most recent generation that has files
          const latestWithFiles = generations.find((g: any) => 
            (g.status === 'completed' || g.status === 'failed') && 
            g.fileChanges && 
            Array.isArray(g.fileChanges) &&
            g.fileChanges.length > 0
          );

          if (latestWithFiles) {
             // Transform fileChanges to proper GeneratedFile format
             const files = transformFileChanges(latestWithFiles.fileChanges);
             console.log('[useGeneration] Loaded files from DB:', files.map(f => f.path));
             setGeneratedFiles(files);
          }
        }
      } catch (err) {
        console.log('Failed to fetch latest generation:', err);
      }
    };

    fetchLatest();
  }, [projectId]);

  const handleStart = useCallback((data: { generationId: string }) => {
    setIsGenerating(true);
    setError(null);
    setGeneratedFiles([]);
    setLogMessages([]);
    console.log('Generation started:', data.generationId);
  }, []);

  const handleProgress = useCallback((data: { generationId: string; phase: GenerationPhase }) => {
    setCurrentPhase(data.phase);
    console.log('Generation progress:', data.phase);
  }, []);

  const handleComplete = useCallback((data: { generationId: string; files: GeneratedFile[] }) => {
    setIsGenerating(false);
    setGeneratedFiles(data.files);
    setCurrentPhase(null);
    console.log('Generation complete:', data.files.length, 'files');
  }, []);

  const handleError = useCallback((data: { generationId: string; error: string }) => {
    setIsGenerating(false);
    setError(data.error);
    setCurrentPhase(null);
    console.log('Generation error:', data.error);
  }, []);

  const handleLog = useCallback((data: { generationId: string; message: string }) => {
    setLogMessages(prev => [...prev, data.message]);
  }, []);

  const { isConnected } = useSocket({
    projectId,
    onGenerationStart: handleStart,
    onGenerationProgress: handleProgress,
    onGenerationComplete: handleComplete,
    onGenerationError: handleError,
    onGenerationLog: handleLog,
  });

  const startGeneration = useCallback(async (prompt: string, prdId?: string, files?: GeneratedFile[]) => {
    setIsGenerating(true);
    setError(null);

    try {
      await generationsApi.generate(projectId, { prompt, prdId, files });
      // Generation started - WebSocket will handle progress
    } catch (err: any) {
      setIsGenerating(false);
      setError(err.message);
    }
  }, [projectId]);

  return {
    isConnected,
    isGenerating,
    currentPhase,
    generatedFiles,
    error,
    logMessages,
    startGeneration,
  };
}

export type { GenerationPhase, GeneratedFile };
