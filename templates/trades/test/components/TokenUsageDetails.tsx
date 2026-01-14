'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Calendar, Folder, ChevronLeft, ChevronRight, Clock, Cpu, DollarSign, ArrowUpDown, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getApiUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

interface UsageByProject {
  projectId: string | null;
  projectName: string | null;
  totalInput: number;
  totalOutput: number;
  total: number;
  requestCount: number;
  estimatedCost: number;
  firstUsed: string;
  lastUsed: string;
}

interface UsageByDate {
  date: string;
  totalInput: number;
  totalOutput: number;
  total: number;
  requestCount: number;
  estimatedCost: number;
}

interface UsageByDateByModel {
  date: string;
  model: string;
  provider: string;
  totalTokens: number;
  estimatedCost: number;
}

interface UsageLog {
  id: string;
  createdAt: string;
  projectId: string | null;
  projectName: string | null;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  context: string | null;
  estimatedCost: number;
  userId?: number;
  userEmail?: string;
}

interface UsageDetailsData {
  usageByProject: UsageByProject[];
  usageByDate: UsageByDate[];
  usageByTimeByModel: UsageByDateByModel[];
  logs: UsageLog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface TokenUsageDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  initialFilters?: {
    model?: string;
    userId?: number;
    userEmail?: string;
  };
}

type TabType = 'projects' | 'dates' | 'logs' | 'graph';
type DatePreset = '7d' | '30d' | '90d' | 'all';
type Granularity = 'day' | 'week' | 'month' | 'year';

const COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export function TokenUsageDetails({ isOpen, onClose, isAdmin = false, initialFilters }: TokenUsageDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UsageDetailsData | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('graph');
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [granularity, setGranularity] = useState<Granularity>('day');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [modelFilter, setModelFilter] = useState<string>(initialFilters?.model || '');
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<string>('total');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const limit = 20;

  const getDateRange = useCallback((preset: DatePreset): { startDate?: Date; endDate?: Date } => {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23, 59, 59, 999);

    switch (preset) {
      case '7d':
        return {
          startDate: new Date(now.setDate(now.getDate() - 7)),
          endDate
        };
      case '30d':
        return {
          startDate: new Date(now.setDate(now.getDate() - 30)),
          endDate
        };
      case '90d':
        return {
          startDate: new Date(now.setDate(now.getDate() - 90)),
          endDate
        };
      case 'all':
        return {};
    }
  }, []);

  // Reset granularity when date preset changes to reasonable defaults
  useEffect(() => {
    if (datePreset === '7d') setGranularity('day');
    if (datePreset === '30d') setGranularity('day');
    if (datePreset === '90d') setGranularity('week');
    if (datePreset === 'all') setGranularity('month');
  }, [datePreset]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      const endpoint = isAdmin ? '/api/v1/usage/global/details' : '/api/v1/usage/me/details';

      const params = new URLSearchParams();
      const dateRange = getDateRange(datePreset);
      if (dateRange.startDate) params.append('startDate', dateRange.startDate.toISOString());
      if (dateRange.endDate) params.append('endDate', dateRange.endDate.toISOString());
      if (projectFilter) params.append('projectId', projectFilter);
      if (modelFilter) params.append('model', modelFilter);
      params.append('granularity', granularity);
      params.append('limit', limit.toString());
      params.append('offset', (page * limit).toString());

      const response = await fetch(`${apiUrl}${endpoint}?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch usage details:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, datePreset, projectFilter, modelFilter, page, granularity, getDateRange]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  useEffect(() => {
    if (initialFilters?.model) {
      setModelFilter(initialFilters.model);
    }
  }, [initialFilters]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const sortData = <T extends Record<string, any>>(items: T[], field: string, direction: 'asc' | 'desc'): T[] => {
    return [...items].sort((a, b) => {
      const aVal = a[field] ?? 0;
      const bVal = b[field] ?? 0;
      return direction === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const chartData = useMemo(() => {
    if (!data?.usageByTimeByModel) return [];

    // Group by date
    const groupedByDate = data.usageByTimeByModel.reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = { date: curr.date };
      }
      acc[curr.date][curr.model] = curr.totalTokens;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedByDate).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const uniqueModels = useMemo(() => {
    if (!data?.usageByTimeByModel) return [];
    return Array.from(new Set(data.usageByTimeByModel.map(item => item.model)));
  }, [data]);

  if (!isOpen) return null;

  const totalPages = data ? Math.ceil(data.pagination.total / limit) : 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Usage Details</h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                {isAdmin ? 'Global token usage breakdown' : 'Your token usage breakdown'}
                {initialFilters?.userEmail && ` for ${initialFilters.userEmail}`}
                {modelFilter && ` (filtered by ${modelFilter})`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mt-4">
            {/* Date Preset */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
              {(['7d', '30d', '90d', 'all'] as DatePreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => { setDatePreset(preset); setPage(0); }}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-md transition-colors',
                    datePreset === preset
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  {preset === 'all' ? 'All Time' : `Last ${preset.replace('d', ' days')}`}
                </button>
              ))}
            </div>

            {/* Model Filter */}
            {modelFilter && (
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5">
                <Cpu className="w-4 h-4 text-gray-400 dark:text-zinc-400" />
                <span className="text-sm text-gray-700 dark:text-zinc-300">{modelFilter}</span>
                <button
                  onClick={() => { setModelFilter(''); setPage(0); }}
                  className="text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-gray-100 dark:bg-zinc-800/50 rounded-lg p-1 w-fit">
            {[
              { id: 'graph', label: 'Graph', icon: BarChart2 },
              { id: 'projects', label: 'By Project', icon: Folder },
              { id: 'dates', label: 'By Date', icon: Calendar },
              { id: 'logs', label: 'Request Logs', icon: Clock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as TabType); setPage(0); }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors',
                  activeTab === tab.id
                    ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-white dark:bg-zinc-900">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : !data ? (
            <div className="text-center text-gray-500 dark:text-zinc-500 py-12">Failed to load data</div>
          ) : (
            <>
              {/* Graph Tab */}
              {activeTab === 'graph' && (
                <div className="h-full flex flex-col">
                  {/* Granularity Controls */}
                  <div className="flex justify-end mb-4">
                     <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
                      {(['day', 'week', 'month', 'year'] as Granularity[]).map((g) => (
                        <button
                          key={g}
                          onClick={() => setGranularity(g)}
                          className={cn(
                            'px-3 py-1.5 text-xs uppercase font-medium rounded-md transition-colors',
                            granularity === g
                              ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {chartData.length === 0 ? (
                     <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-zinc-500">
                        No data available for graph
                     </div>
                  ) : (
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-800" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke="#9ca3af" 
                            fontSize={12} 
                            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { 
                                month: 'short', 
                                day: granularity === 'day' ? 'numeric' : undefined 
                            })}
                          />
                          <YAxis 
                            stroke="#9ca3af" 
                            fontSize={12}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', color: 'var(--tooltip-text)' }}
                            itemStyle={{ color: 'var(--tooltip-text)' }}
                            formatter={(value: number | undefined) => [value?.toLocaleString() || '0', 'Tokens']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          />
                          <Legend wrapperStyle={{ color: 'var(--tooltip-text)' }} />
                          {uniqueModels.map((model, index) => (
                            <Bar 
                              key={model} 
                              dataKey={model} 
                              stackId="a" 
                              fill={COLORS[index % COLORS.length]} 
                              name={model.replace('models/', '')} // Clean up model names if needed
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* By Project Tab */}
              {activeTab === 'projects' && (
                <div className="space-y-2">
                  {data.usageByProject.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-zinc-500 py-8">No project data available</div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                        <div className="col-span-4">Project</div>
                        <div className="col-span-2 text-right cursor-pointer hover:text-gray-700 dark:hover:text-zinc-300" onClick={() => handleSort('total')}>
                          <span className="flex items-center justify-end gap-1">
                            Tokens <ArrowUpDown className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="col-span-2 text-right">Requests</div>
                        <div className="col-span-2 text-right cursor-pointer hover:text-gray-700 dark:hover:text-zinc-300" onClick={() => handleSort('estimatedCost')}>
                          <span className="flex items-center justify-end gap-1">
                            Cost <ArrowUpDown className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="col-span-2 text-right">Last Used</div>
                      </div>
                      {/* Rows */}
                      {sortData(data.usageByProject, sortField, sortDir).map((project, idx) => (
                        <div
                          key={project.projectId || `no-project-${idx}`}
                          className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-zinc-800/30 hover:bg-gray-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
                          onClick={() => {
                            if (project.projectId) {
                              setProjectFilter(project.projectId);
                              setActiveTab('logs');
                              setPage(0);
                            }
                          }}
                        >
                          <div className="col-span-4 flex items-center gap-3">
                            <div className="p-2 bg-gray-200 dark:bg-zinc-700/50 rounded-lg">
                              <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {project.projectName || 'No Project'}
                              </p>
                              {project.projectId && (
                                <p className="text-xs text-gray-500 dark:text-zinc-500 truncate">{project.projectId.slice(0, 8)}...</p>
                              )}
                            </div>
                          </div>
                          <div className="col-span-2 text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{project.total.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 dark:text-zinc-500">
                              In: {project.totalInput.toLocaleString()} / Out: {project.totalOutput.toLocaleString()}
                            </p>
                          </div>
                          <div className="col-span-2 text-right">
                            <p className="text-sm text-gray-700 dark:text-zinc-300">{project.requestCount}</p>
                          </div>
                          <div className="col-span-2 text-right">
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">${project.estimatedCost.toFixed(4)}</p>
                          </div>
                          <div className="col-span-2 text-right">
                            <p className="text-sm text-gray-500 dark:text-zinc-400">{formatDate(project.lastUsed)}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* By Date Tab */}
              {activeTab === 'dates' && (
                <div className="space-y-2">
                  {data.usageByDate.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-zinc-500 py-8">No date data available</div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                        <div className="col-span-3">Date</div>
                        <div className="col-span-3 text-right">Tokens</div>
                        <div className="col-span-3 text-right">Requests</div>
                        <div className="col-span-3 text-right">Cost</div>
                      </div>
                      {/* Rows */}
                      {data.usageByDate.map((dateRecord) => (
                        <div
                          key={dateRecord.date}
                          className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-zinc-800/30 hover:bg-gray-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                        >
                          <div className="col-span-3 flex items-center gap-3">
                            <div className="p-2 bg-gray-200 dark:bg-zinc-700/50 rounded-lg">
                              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(dateRecord.date)}</p>
                          </div>
                          <div className="col-span-3 text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{dateRecord.total.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 dark:text-zinc-500">
                              In: {dateRecord.totalInput.toLocaleString()} / Out: {dateRecord.totalOutput.toLocaleString()}
                            </p>
                          </div>
                          <div className="col-span-3 text-right">
                            <p className="text-sm text-gray-700 dark:text-zinc-300">{dateRecord.requestCount}</p>
                          </div>
                          <div className="col-span-3 text-right">
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">${dateRecord.estimatedCost.toFixed(4)}</p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* Request Logs Tab */}
              {activeTab === 'logs' && (
                <div className="space-y-2">
                  {/* Active Filter Indicator */}
                  {projectFilter && (
                    <div className="flex items-center gap-2 mb-4 p-2 bg-gray-100 dark:bg-zinc-800/50 rounded-lg">
                      <span className="text-sm text-gray-500 dark:text-zinc-400">Filtered by project:</span>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {data.usageByProject.find(p => p.projectId === projectFilter)?.projectName || projectFilter}
                      </span>
                      <button
                        onClick={() => { setProjectFilter(''); setPage(0); }}
                        className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                      >
                        Clear filter
                      </button>
                    </div>
                  )}

                  {data.logs.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-zinc-500 py-8">No logs available</div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                        <div className="col-span-2">Time</div>
                        <div className="col-span-2">Project</div>
                        <div className="col-span-2">Model</div>
                        <div className="col-span-2 text-right">Tokens</div>
                        <div className="col-span-2 text-right">Cost</div>
                        <div className="col-span-2">Context</div>
                      </div>
                      {/* Rows */}
                      {data.logs.map((log) => (
                        <div
                          key={log.id}
                          className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-zinc-800/30 hover:bg-gray-100 dark:hover:bg-zinc-800/50 rounded-lg transition-colors"
                        >
                          <div className="col-span-2">
                            <p className="text-sm text-gray-700 dark:text-zinc-300">{formatDateTime(log.createdAt)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-900 dark:text-white truncate" title={log.projectName || 'No Project'}>
                              {log.projectName || <span className="text-gray-500 dark:text-zinc-500">No Project</span>}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-700 dark:text-zinc-300 truncate" title={log.model}>{log.model}</p>
                            <p className="text-xs text-gray-500 dark:text-zinc-500">{log.provider}</p>
                          </div>
                          <div className="col-span-2 text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{log.totalTokens.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 dark:text-zinc-500">
                              {log.inputTokens.toLocaleString()} / {log.outputTokens.toLocaleString()}
                            </p>
                          </div>
                          <div className="col-span-2 text-right">
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">${log.estimatedCost.toFixed(4)}</p>
                          </div>
                          <div className="col-span-2">
                            {log.context ? (
                              <span className="inline-block px-2 py-1 text-xs bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded">
                                {log.context}
                              </span>
                            ) : (
                              <span className="text-gray-500 dark:text-zinc-600">-</span>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
                          <p className="text-sm text-gray-500 dark:text-zinc-500">
                            Showing {page * limit + 1} - {Math.min((page + 1) * limit, data.pagination.total)} of {data.pagination.total}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPage(Math.max(0, page - 1))}
                              disabled={page === 0}
                              className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-500 dark:text-zinc-400">
                              Page {page + 1} of {totalPages}
                            </span>
                            <button
                              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                              disabled={!data.pagination.hasMore}
                              className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Summary */}
        {data && !loading && (
          <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-gray-500 dark:text-zinc-500" />
                  <span className="text-sm text-gray-500 dark:text-zinc-400">
                    Total: <span className="text-gray-900 dark:text-white font-medium">
                      {data.usageByProject.reduce((acc, p) => acc + p.total, 0).toLocaleString()} tokens
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500 dark:text-zinc-500" />
                  <span className="text-sm text-gray-500 dark:text-zinc-400">
                    Est. Cost: <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      ${data.usageByProject.reduce((acc, p) => acc + p.estimatedCost, 0).toFixed(4)}
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
