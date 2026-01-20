'use client';

import { useState, useEffect } from 'react';
import { GitBranch, ExternalLink, Upload, RefreshCw, ChevronDown, ChevronUp, Zap, AlertTriangle, History, Clock } from 'lucide-react';
import { get, post, put } from '@/lib/api';

interface GitPanelProps {
  projectId: string;
  projectName: string;
}

interface GitConnection {
  connected: boolean;
  provider?: 'github' | 'gitlab';
  username?: string;
  avatarUrl?: string;
}

interface ProjectRepo {
  repoEnabled: boolean;
  repoUrl: string | null;
  repoFullName: string | null;
  lastPushAt: string | null;
  autoPushOnGenerate: boolean;
  defaultBranch?: string;
}

interface Branch {
  name: string;
  sha: string;
  isDefault: boolean;
}

interface PushHistoryItem {
  id: string;
  commitSha: string;
  commitMessage: string;
  branch: string;
  filesCount: number;
  createdAt: string;
}

interface ConflictCheck {
  hasConflicts: boolean;
  message: string;
  newCommitsCount?: number;
}

export function GitPanel({ projectId, projectName }: GitPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPushing, setIsPushing] = useState(false);
  const [gitConfig, setGitConfig] = useState<{ configured: boolean; provider: string | null }>({ configured: false, provider: null });
  const [connection, setConnection] = useState<GitConnection>({ connected: false });
  const [repo, setRepo] = useState<ProjectRepo>({ repoEnabled: false, repoUrl: null, repoFullName: null, lastPushAt: null, autoPushOnGenerate: false });
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [conflictCheck, setConflictCheck] = useState<ConflictCheck | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [pushHistory, setPushHistory] = useState<PushHistoryItem[]>([]);

  useEffect(() => {
    fetchGitStatus();
  }, [projectId]);

  useEffect(() => {
    if (repo.repoEnabled && selectedBranch) {
      checkConflicts();
    }
  }, [selectedBranch]);

  const fetchGitStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsLoading(true);
      
      // Check if git is configured
      const configRes = await get('/api/v1/git/config', token);
      if (configRes.ok) {
        const configData = await configRes.json();
        setGitConfig(configData.data || { configured: false, provider: null });
      }

      // Check user connection
      const connRes = await get('/api/v1/git/connection', token);
      if (connRes.ok) {
        const connData = await connRes.json();
        setConnection(connData.data || { connected: false });
      }

      // Get project details for repo info
      const projectRes = await get(`/api/v1/projects/${projectId}`, token);
      if (projectRes.ok) {
        const projectData = await projectRes.json();
        const project = projectData.data?.project || projectData.project;
        if (project) {
          setRepo({
            repoEnabled: project.repoEnabled || false,
            repoUrl: project.repoUrl || null,
            repoFullName: project.repoFullName || null,
            lastPushAt: project.lastPushAt || null,
            autoPushOnGenerate: project.autoPushOnGenerate || false,
            defaultBranch: project.defaultBranch || 'main',
          });
          setSelectedBranch(project.defaultBranch || 'main');

          // Fetch branches if repo is enabled
          if (project.repoEnabled) {
            fetchBranches(token);
            fetchPushHistory(token);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching git status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async (token: string) => {
    try {
      const res = await get(`/api/v1/git/repos/${projectId}/branches`, token);
      if (res.ok) {
        const data = await res.json();
        setBranches(data.data?.branches || []);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchPushHistory = async (token: string) => {
    try {
      const res = await get(`/api/v1/git/repos/${projectId}/history?limit=10`, token);
      if (res.ok) {
        const data = await res.json();
        setPushHistory(data.data?.history || []);
      }
    } catch (err) {
      console.error('Error fetching push history:', err);
    }
  };

  const checkConflicts = async () => {
    const token = localStorage.getItem('token');
    if (!token || !selectedBranch) return;

    try {
      const res = await get(`/api/v1/git/repos/${projectId}/check-conflicts?branch=${selectedBranch}`, token);
      if (res.ok) {
        const data = await res.json();
        setConflictCheck(data.data);
      }
    } catch (err) {
      console.error('Error checking conflicts:', err);
    }
  };

  const handleConnect = () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/git/connect`, '_blank');
  };

  const handleCreateRepo = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsPushing(true);
      const res = await post('/api/v1/git/repos', {
        projectId,
        name: projectName,
      }, token);

      if (res.ok) {
        const data = await res.json();
        setRepo({
          repoEnabled: true,
          repoUrl: data.data?.repo?.url || null,
          repoFullName: data.data?.repo?.fullName || null,
          lastPushAt: null,
          autoPushOnGenerate: false,
          defaultBranch: data.data?.repo?.defaultBranch || 'main',
        });
        setSelectedBranch(data.data?.repo?.defaultBranch || 'main');
        setError(null);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to create repository');
      }
    } catch (err) {
      setError('Failed to create repository');
    } finally {
      setIsPushing(false);
    }
  };

  const handlePush = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsPushing(true);
      const res = await post(`/api/v1/git/repos/${projectId}/push`, { 
        smart: true,
        branch: selectedBranch,
      }, token);

      if (res.ok) {
        const data = await res.json();
        setRepo(prev => ({
          ...prev,
          lastPushAt: new Date().toISOString(),
        }));
        setError(null);
        setConflictCheck(null);
        // Refresh history
        fetchPushHistory(token);
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to push');
      }
    } catch (err) {
      setError('Failed to push to repository');
    } finally {
      setIsPushing(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleToggleAutoPush = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const newValue = !repo.autoPushOnGenerate;
      const res = await put(`/api/v1/projects/${projectId}`, { 
        autoPushOnGenerate: newValue 
      }, token);

      if (res.ok) {
        setRepo(prev => ({ ...prev, autoPushOnGenerate: newValue }));
      }
    } catch (err) {
      console.error('Failed to toggle auto-push:', err);
    }
  };

  // Don't show if git not configured
  if (!isLoading && !gitConfig.configured) {
    return null;
  }

  const providerName = gitConfig.provider === 'github' ? 'GitHub' : 'GitLab';

  return (
    <div className="border border-gray-200 dark:border-[#3A3A3A] rounded-lg bg-white dark:bg-[#25262b] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2e2f33] transition-colors"
      >
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white text-sm">Git</span>
          {repo.repoFullName && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {repo.repoFullName}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-[#3A3A3A]">
          {isLoading ? (
            <div className="py-4 flex items-center justify-center">
              <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          ) : !connection.connected ? (
            // Not connected
            <div className="py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Connect your {providerName} account to push code to repositories.
              </p>
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <GitBranch className="h-4 w-4" />
                Connect {providerName}
              </button>
            </div>
          ) : !repo.repoEnabled ? (
            // Connected but no repo
            <div className="py-4">
              <div className="flex items-center gap-2 mb-3">
                {connection.avatarUrl && (
                  <img src={connection.avatarUrl} alt="" className="h-5 w-5 rounded-full" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Connected as <span className="font-medium text-gray-900 dark:text-white">{connection.username}</span>
                </span>
              </div>
              <button
                onClick={handleCreateRepo}
                disabled={isPushing}
                className="flex items-center gap-2 px-3 py-2 accent-bg text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPushing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <GitBranch className="h-4 w-4" />
                )}
                Create Repository
              </button>
            </div>
          ) : (
            // Has repo
            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {connection.avatarUrl && (
                    <img src={connection.avatarUrl} alt="" className="h-5 w-5 rounded-full" />
                  )}
                  <a
                    href={repo.repoUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-[#205ab2] dark:text-[#4a8fe7] hover:underline flex items-center gap-1"
                  >
                    {repo.repoFullName}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {repo.lastPushAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Pushed {formatTimeAgo(repo.lastPushAt)}
                  </span>
                )}
              </div>

              {/* Branch Selection */}
              {branches.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400">Branch:</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="flex-1 text-sm px-2 py-1 rounded border border-gray-300 dark:border-[#3A3A3A] bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white"
                  >
                    {branches.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name} {b.isDefault ? '(default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Conflict Warning */}
              {conflictCheck?.hasConflicts && (
                <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-amber-700 dark:text-amber-300">{conflictCheck.message}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Pushing will overwrite remote changes. Consider pulling first.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}

              {/* Auto-push toggle */}
              <label className="flex items-center gap-2 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={repo.autoPushOnGenerate}
                  onChange={handleToggleAutoPush}
                  className="w-4 h-4 rounded border-gray-300 dark:border-[#3A3A3A] text-[#205ab2] focus:ring-[#205ab2]"
                />
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Auto-push on generation</span>
              </label>

              <button
                onClick={handlePush}
                disabled={isPushing}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 accent-bg text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPushing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Push to {providerName}
              </button>

              {/* Push History Toggle */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-center gap-2 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <History className="h-3 w-3" />
                {showHistory ? 'Hide History' : 'Show Push History'}
              </button>

              {/* Push History */}
              {showHistory && pushHistory.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {pushHistory.map((item) => (
                    <div key={item.id} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-[#1e1e1e] rounded text-xs">
                      <Clock className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white truncate">{item.commitMessage}</p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {item.branch} • {item.filesCount} files • {formatTimeAgo(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
