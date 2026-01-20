'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { getApiUrl } from '@/lib/api';
import { projectsApi, generationsApi } from '@/lib/builder-api';
import { useGeneration } from '@/hooks/useSocket';
import { useDeployment } from '@/hooks/useDeployment';
import { usePresence } from '@/hooks/usePresence';
import { ChatPanel } from '@/components/builder/ChatPanel';
import { CodeEditor } from '@/components/builder/CodeEditor';
import { DeployModal } from '@/components/builder/DeployModal';
import { GenerationLoader } from '@/components/builder/GenerationLoader';
import { PrdModeSelector } from '@/components/builder/PrdModeSelector';
import { PrdGenerator } from '@/components/builder/PrdGenerator';
import { PrdEditor } from '@/components/builder/PrdEditor';
import { WebContainerPreview } from '@/components/builder/WebContainerPreview';
import { PresenceAvatars } from '@/components/collaboration';
import { 
  FolderKanban, 
  Code, 
  Eye, 
  FileText, 
  Settings,
  Share2,
  Upload,
  ChevronLeft,
  Bug
} from 'lucide-react';

// Create a client
const queryClient = new QueryClient();

type ViewMode = 'preview' | 'code' | 'prd';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  language?: string;
}

function BuilderContent() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const projectId = params.projectId as string;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('prd');
  const [showChat, setShowChat] = useState(false);
  const [chatWidth, setChatWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<'explorer' | 'search' | null>('explorer');
  const [files, setFiles] = useState<FileNode[]>([]);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [lastGenerationId, setLastGenerationId] = useState<string>();
  const [modifiedFiles, setModifiedFiles] = useState<Map<string, string>>(new Map());
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [prdGenerationMode, setPrdGenerationMode] = useState<'auto' | 'interview' | null>(null);
  const [recentLogs, setRecentLogs] = useState<string[]>([]);
  const [previewError, setPreviewError] = useState<{
    message: string;
    filePath?: string;
    lineNumber?: number;
    columnNumber?: number;
    stackTrace?: string;
  } | null>(null);
  const [isFixing, setIsFixing] = useState(false);

  // Track if this is the initial load - don't switch tabs on initial file load
  const isInitialLoad = useRef(true);
  const previousGeneratingState = useRef(false);

  // Check if recent logs contain error indicators
  const hasErrorInLogs = recentLogs.some(log => 
    log.includes('Error:') || 
    log.includes('TypeError:') || 
    log.includes('ReferenceError:') ||
    log.includes('Unhandled Runtime Error') ||
    log.includes('Failed to compile') ||
    log.includes('error') && log.includes('.tsx') ||
    log.includes('error') && log.includes('.ts')
  );

  // Fetch project with react-query
  const { data: projectData, isLoading, error, refetch: refetchProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.get(projectId),
    enabled: !!projectId,
  });

  const project = projectData?.project;

  // Use hooks
  const { 
    isConnected, 
    isGenerating, 
    currentPhase, 
    generatedFiles, 
    error: generationError,
    logMessages,
    startGeneration 
  } = useGeneration(projectId);

  const {
    deploy,
    isDeploying,
    deploymentUrl,
    deploymentError,
    reset: resetDeployment,
  } = useDeployment(projectId);

  const { users } = usePresence(projectId);

  // Restore generation mode from PRD status
  useEffect(() => {
    if (project?.prds && project.prds.length > 0) {
      const latestPrd = project.prds[0];
      if (latestPrd.status === 'interviewing') {
        setPrdGenerationMode('interview');
      }
    }
  }, [project]);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const apiUrl = getApiUrl();
      
      // Silently fetch profile - don't throw on network errors
      fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      })
        .then(res => {
          if (!res.ok) return null; // Silently fail on non-200
          return res.json();
        })
        .then(data => {
          if (data) {
            const userData = data.data || data;
            setIsAdmin(userData.roles?.includes('Site Admin'));
          }
        })
        .catch(() => {
          // Silently ignore network errors - user is still authenticated via token
        });
    }
  }, []);

  // Convert generated files to file tree
  // Only switch to 'code' tab when a NEW generation completes, not on initial load
  useEffect(() => {
    if (generatedFiles.length > 0) {
      const fileTree = buildFileTree(generatedFiles);
      setFiles(fileTree);
      setModifiedFiles(new Map());
      setUnsavedChanges(false);

      // Only switch to code tab if this was from a completed generation (not initial load)
      if (!isInitialLoad.current && previousGeneratingState.current && !isGenerating) {
        setViewMode('code');
      }
    }

    // Mark initial load as complete after first render
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    }

    // Track previous generating state
    previousGeneratingState.current = isGenerating;
  }, [generatedFiles, isGenerating]);

  // Sync chat visibility with view mode
  useEffect(() => {
    if (viewMode === 'code' || viewMode === 'preview') {
      setShowChat(true);
    } else {
      setShowChat(false);
    }
  }, [viewMode]);

  // Add keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFiles();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modifiedFiles, files]);

  // Build file tree from flat array
  const buildFileTree = (files: Array<{ path: string; content: string; language: string }>): FileNode[] => {
    const root: FileNode[] = [];
    
    files.forEach(file => {
      const parts = file.path.split('/').filter(Boolean);
      let current = root;
      
      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1;
        let existing = current.find(n => n.name === part);
        
        if (!existing) {
          existing = isFile 
            ? { name: part, path: file.path, type: 'file', content: file.content, language: file.language }
            : { name: part, path: '/' + parts.slice(0, index + 1).join('/'), type: 'folder', children: [] };
          current.push(existing);
        }
        
        if (!isFile) {
          current = existing.children!;
        }
      });
    });
    
    return root;
  };

  // Flatten file tree, excluding system directories
  const flattenFiles = (nodes: FileNode[]): Array<{ path: string; content: string; language: string }> => {
    const result: Array<{ path: string; content: string; language: string }> = [];
    const traverse = (node: FileNode) => {
      // Skip system directories
      if (node.type === 'folder' && [
        'node_modules', 
        '.next', 
        '.git', 
        '.swc', 
        '.turbo', 
        'dist', 
        'build', 
        'coverage'
      ].includes(node.name)) {
        return;
      }

      if (node.type === 'file' && node.content) {
        result.push({ path: node.path, content: node.content, language: node.language || 'typescript' });
      }
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    nodes.forEach(traverse);
    return result;
  };

  const handleFileChange = (path: string, content: string) => {
    setModifiedFiles((prev) => {
      const next = new Map(prev);
      next.set(path, content);
      return next;
    });
    setUnsavedChanges(true);
  };

  const handleSaveFiles = () => {
    if (modifiedFiles.size === 0) return;

    const updateFileContent = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.type === 'file' && modifiedFiles.has(node.path)) {
          return { ...node, content: modifiedFiles.get(node.path)! };
        }
        if (node.type === 'folder' && node.children) {
          return { ...node, children: updateFileContent(node.children) };
        }
        return node;
      });
    };

    const updatedFiles = updateFileContent(files);
    setFiles(updatedFiles);
    setModifiedFiles(new Map());
    setUnsavedChanges(false);
  };

  const handleFilesUpdated = () => {
    setUnsavedChanges(false);
    setModifiedFiles(new Map());
  };

  const handleGenerate = async (prompt: string) => {
    const currentFiles = files.length > 0 ? flattenFiles(files) : undefined;
    await startGeneration(prompt, undefined, currentFiles);
  };

  const handleLog = (log: string) => {
    setRecentLogs(prev => [...prev.slice(-49), log]);
  };

  const handleError = (error: {
    message: string;
    filePath?: string;
    lineNumber?: number;
    columnNumber?: number;
    stackTrace?: string;
  }) => {
    setPreviewError(error);
  };

  // Find file content by path in the file tree
  const findFileContent = (nodes: FileNode[], targetPath: string): string | undefined => {
    for (const node of nodes) {
      if (node.type === 'file' && node.path === targetPath) {
        return node.content;
      }
      if (node.children) {
        const found = findFileContent(node.children, targetPath);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Update a specific file in the tree
  const updateFileInTree = (nodes: FileNode[], targetPath: string, newContent: string): FileNode[] => {
    return nodes.map(node => {
      if (node.type === 'file' && node.path === targetPath) {
        return { ...node, content: newContent };
      }
      if (node.children) {
        return { ...node, children: updateFileInTree(node.children, targetPath, newContent) };
      }
      return node;
    });
  };

  const handleDebug = async () => {
    // Work with previewError if available, or try to parse from logs
    let errorInfo = previewError;
    
    // If no structured error, try to extract from logs
    if (!errorInfo && hasErrorInLogs) {
      const errorLogs = recentLogs.filter(log => 
        log.includes('Error:') || 
        log.includes('TypeError:') || 
        log.includes('ReferenceError:')
      );
      
      // Try to parse file path from logs
      const allLogs = recentLogs.join('\n');
      const fileMatch = allLogs.match(/([a-zA-Z0-9_\-/.]+\.tsx?):([0-9]+):([0-9]+)/);
      
      errorInfo = {
        message: errorLogs[0] || 'Runtime error detected',
        filePath: fileMatch ? (fileMatch[1].startsWith('/') ? fileMatch[1] : '/' + fileMatch[1]) : undefined,
        lineNumber: fileMatch ? parseInt(fileMatch[2], 10) : undefined,
        columnNumber: fileMatch ? parseInt(fileMatch[3], 10) : undefined,
        stackTrace: allLogs
      };
    }
    
    // If still no error info, inform user
    if (!errorInfo) {
      alert(
        'No error detected yet.\n\n' +
        'Make sure you are viewing the Preview tab and the error is visible.\n\n' +
        'If the error just appeared, click Debug again - it may take a moment to capture.'
      );
      return;
    }
    
    if (!errorInfo) return;

    // If we have a specific file path, use targeted fix
    if (errorInfo.filePath) {
      const fileContent = findFileContent(files, errorInfo.filePath);
      
      if (fileContent) {
        setIsFixing(true);
        try {
          // Get all files for context
          const allFiles = flattenFiles(files).map(f => ({ path: f.path, content: f.content }));
          
          const result = await generationsApi.fixError(projectId, {
            errorMessage: errorInfo.message,
            filePath: errorInfo.filePath,
            fileContent,
            lineNumber: errorInfo.lineNumber,
            stackTrace: errorInfo.stackTrace,
            allFiles
          });

          // Update just that file in the tree
          const updatedFiles = updateFileInTree(files, result.filePath, result.fixedContent);
          setFiles(updatedFiles);
          setPreviewError(null);
          setRecentLogs([]);  // Clear logs after fix
          
          // Clear the error and show success briefly
          console.log('Fix applied:', result.explanation);
        } catch (error: any) {
          console.error('Failed to fix error:', error);
          // Fall back to full regeneration on failure
          const prompt = `Fix the following error in ${errorInfo.filePath}:\n\n${errorInfo.message}\n\n${errorInfo.stackTrace || ''}`;
          const currentFiles = flattenFiles(files);
          await startGeneration(prompt, undefined, currentFiles);
        } finally {
          setIsFixing(false);
        }
        return;
      }
    }

    // Fallback: full regeneration if no specific file path
    const errorContext = errorInfo.message ? `Error: ${errorInfo.message}\n` : '';
    const logContext = recentLogs.length > 0 ? `Recent Logs:\n${recentLogs.join('\n')}` : '';
    
    if (!errorContext && !logContext) return;

    const prompt = `Fix the following error in my app:\n\n${errorContext}\n${logContext}\n\nPlease analyze the logs and error message, identify the issue, and fix the code.`;
    const currentFiles = flattenFiles(files);
    await startGeneration(prompt, undefined, currentFiles);
  };

  // Handle chat resize
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 300 && newWidth <= 800) {
          setChatWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Project not found</h1>
            <button
              onClick={() => router.push('/projects')}
              className="text-blue-400 hover:text-blue-300"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
      <div className="h-[calc(100vh-4rem)] bg-zinc-900 flex flex-col">
        {/* Builder Header */}
        <header className="h-14 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/projects')}
              className="text-zinc-300 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Projects
            </button>
            <div className="h-6 w-px bg-zinc-700" />
            <h1 className="text-lg font-semibold text-white">{project.name}</h1>
            
            {unsavedChanges && (
              <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-400 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Unsaved (⌘S to save)
              </span>
            )}
            
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-zinc-500'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
            
            {isGenerating && currentPhase && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-400"></div>
                <span className="capitalize">{currentPhase.name}: {currentPhase.message || currentPhase.status}</span>
              </div>
            )}
            
            {generationError && (
              <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
                Error: {generationError}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {users.length > 0 && (
              <PresenceAvatars users={users} maxDisplay={4} />
            )}
            
            <div className="h-6 w-px bg-zinc-700" />
            
            <button className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button className="px-4 py-1.5 text-sm bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={() => setShowDeployModal(true)}
              className="px-4 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-lg hover:from-blue-500 hover:to-sky-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Upload className="w-4 h-4" />
              Deploy
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex" style={{ marginRight: showChat ? `${chatWidth}px` : 0 }}>
            {/* VSCode-like Activity Bar */}
            {viewMode === 'code' && (
              <div className="w-12 bg-[#333333] border-r border-[#2d2d30] flex flex-col items-center py-2 gap-1">
                <button
                  onClick={() => setActiveSidebar(activeSidebar === 'explorer' ? null : 'explorer')}
                  className={`w-12 h-12 flex items-center justify-center transition-colors ${
                    activeSidebar === 'explorer' ? 'text-white border-l-2 border-white' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Explorer"
                >
                  <FolderKanban className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Code/Preview Area */}
            <div className="flex-1 flex flex-col">
              {/* View Toggle */}
              <div className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('prd')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      viewMode === 'prd'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    PRD
                  </button>
                  <button
                    onClick={() => setViewMode('code')}
                    disabled={files.length === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      viewMode === 'code'
                        ? 'bg-blue-600 text-white'
                        : files.length === 0 
                          ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    Code
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    disabled={files.length === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      viewMode === 'preview'
                        ? 'bg-blue-600 text-white'
                        : files.length === 0
                          ? 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleDebug}
                    disabled={files.length === 0 || isFixing || viewMode !== 'preview'}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      files.length === 0 || viewMode !== 'preview'
                        ? 'bg-zinc-800/50 text-zinc-600 border-transparent cursor-not-allowed' 
                        : isFixing
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/20 cursor-wait'
                          : previewError || hasErrorInLogs
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                    }`}
                    title={previewError ? `Fix error in ${previewError.filePath || 'app'}` : hasErrorInLogs ? 'Fix detected errors' : 'Debug with AI - click to analyze errors'}
                  >
                    {isFixing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-amber-400" />
                    ) : (
                      <Bug className="w-4 h-4" />
                    )}
                    <span>{isFixing ? 'Fixing...' : 'Debug'}</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 relative overflow-hidden">
                {/* PRD View */}
                {viewMode === 'prd' && (
                  <div className="absolute inset-0 bg-zinc-950 overflow-y-auto">
                    {prdGenerationMode ? (
                      <PrdGenerator 
                        projectId={projectId} 
                        project={project}
                        initialMode={prdGenerationMode === 'interview' ? 'interview' : 'auto'}
                        onCancel={() => setPrdGenerationMode(null)}
                        onComplete={() => {
                          refetchProject();
                          setPrdGenerationMode(null);
                        }}
                      />
                    ) : project?.prds && project.prds.length > 0 && project.prds[0].sections && Object.keys(project.prds[0].sections as object).length > 0 ? (
                      <div className="pb-20">
                        <PrdEditor 
                          content={project.prds[0].sections}
                          prdId={project.prds[0].id}
                          projectName={project?.name}
                          onUpdate={() => {
                            refetchProject();
                          }}
                          onUpdateProject={(updates) => {
                            qc.setQueryData(['project', projectId], (old: any) => {
                              if (!old || !old.project) return old;
                              return {
                                ...old,
                                project: {
                                  ...old.project,
                                  ...updates
                                }
                              };
                            });
                          }}
                        />
                        <div className="flex justify-center pb-12 gap-4">
                          <button
                            onClick={() => setPrdGenerationMode('interview')}
                            className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-semibold hover:bg-zinc-700 transition-colors border border-zinc-700 hover:border-zinc-600 shadow-lg"
                          >
                            Refine with AI ✨
                          </button>
                          <button
                            onClick={() => startGeneration('Generate app based on this PRD', project.prds[0].id)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl font-semibold hover:from-blue-500 hover:to-sky-500 transition-all shadow-lg shadow-blue-500/20"
                          >
                            Start Building 🚀
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-zinc-950">
                        <PrdModeSelector onSelectMode={setPrdGenerationMode} />
                      </div>
                    )}
                  </div>
                )}

                {/* Code View */}
                {viewMode === 'code' && (
                  <div className="absolute inset-0">
                    <CodeEditor
                      files={files}
                      onFileChange={handleFileChange}
                      activeSidebar={activeSidebar}
                    />
                  </div>
                )}

                {/* Preview View - Keep mounted to avoid teardown errors */}
                {files.length > 0 && (
                  <div 
                    className={`absolute inset-0 ${viewMode === 'preview' ? '' : 'hidden'}`}
                  >
                    <WebContainerPreview
                      files={files}
                      onFilesUpdated={handleFilesUpdated}
                      onLog={handleLog}
                      onError={handleError}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resizable Chat Panel */}
          {showChat && (
            <div
              className="fixed right-0 top-[8rem] bottom-0 bg-zinc-900 border-l border-zinc-800 flex"
              style={{ width: `${chatWidth}px` }}
            >
              {/* Resize Handle */}
              <div
                onMouseDown={handleMouseDown}
                className={`w-1 hover:w-1.5 bg-zinc-800 hover:bg-blue-500 cursor-col-resize transition-all ${
                  isResizing ? 'bg-blue-500 w-1.5' : ''
                }`}
              />

              {/* Chat Content */}
              <div className="flex-1 flex flex-col">
                <ChatPanel
                  projectId={projectId}
                  onGenerate={handleGenerate}
                  onModify={(result) => {
                    // Apply modified files to the file tree
                    let updatedFiles = [...files];
                    
                    for (const modFile of result.modifiedFiles) {
                      if (modFile.action === 'delete') {
                        // Remove file from tree
                        const removeFile = (nodes: FileNode[]): FileNode[] => {
                          return nodes.filter(n => n.path !== modFile.path).map(n => {
                            if (n.children) {
                              return { ...n, children: removeFile(n.children) };
                            }
                            return n;
                          });
                        };
                        updatedFiles = removeFile(updatedFiles);
                      } else if (modFile.action === 'create') {
                        // Add new file to tree via buildFileTree
                        const allFlat = flattenFiles(updatedFiles);
                        allFlat.push({ 
                          path: modFile.path, 
                          content: modFile.content, 
                          language: modFile.path.split('.').pop() || 'typescript' 
                        });
                        updatedFiles = buildFileTree(allFlat);
                      } else {
                        // Modify existing file
                        updatedFiles = updateFileInTree(updatedFiles, modFile.path, modFile.content);
                      }
                    }
                    
                    setFiles(updatedFiles);
                    console.log('[Builder] Applied modification:', result.explanation);
                  }}
                  isGenerating={isGenerating}
                  existingFiles={flattenFiles(files)}
                  hasExistingProject={files.length > 0}
                />
              </div>
            </div>
          )}
        </div>

        {/* Deploy Modal */}
        <DeployModal
          isOpen={showDeployModal}
          onClose={() => {
            setShowDeployModal(false);
            resetDeployment();
          }}
          projectId={projectId}
          generationId={lastGenerationId}
          onDeploy={(provider) => {
            if (lastGenerationId) {
              deploy(lastGenerationId, provider as 'vercel' | 'netlify');
            }
          }}
          isDeploying={isDeploying}
          deploymentUrl={deploymentUrl}
          deploymentError={deploymentError}
        />
        
        <GenerationLoader 
          isVisible={isGenerating} 
          phase={currentPhase}
          logMessages={logMessages}
        />
      </div>
    </Layout>
  );
}

export default function BuilderPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <BuilderContent />
    </QueryClientProvider>
  );
}
