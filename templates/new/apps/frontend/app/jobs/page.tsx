'use client';

import { Layout } from '@/components/Layout';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJobs } from '@/hooks/useJobs';
import { JobCard } from '@/components/jobs/JobCard';
import { KanbanBoard } from '@/components/jobs/KanbanBoard';
import type { Job, JobFilters, KanbanColumn, JobStatus } from '@/types/jobs';
import { JOB_STATUS_COLORS, KANBAN_COLUMNS } from '@/types/jobs';
import { 
  Plus, 
  FolderKanban, 
  Loader2, 
  RefreshCw, 
  LayoutGrid, 
  Columns, 
  Search,
  Filter,
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'kanban' | 'grid';

export default function JobsPage() {
  const router = useRouter();
  const {
    jobs,
    loading,
    error,
    pagination,
    fetchJobs,
    fetchKanban,
    updateJobStatus,
    deleteJob,
    setFilters,
    setPage,
    refresh,
  } = useJobs();
  
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>([]);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [filters, setLocalFilters] = useState<JobFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Job | null>(null);
  
  useEffect(() => {
    if (viewMode === 'kanban') {
      loadKanban();
    } else {
      fetchJobs();
    }
  }, [viewMode]);
  
  const loadKanban = async () => {
    setKanbanLoading(true);
    const columns = await fetchKanban();
    setKanbanColumns(columns);
    setKanbanLoading(false);
  };
  
  const handleViewJob = (job: Job) => {
    router.push(`/jobs/${job.id}`);
  };
  
  const handleEditJob = (job: Job) => {
    router.push(`/jobs/${job.id}?edit=true`);
  };
  
  const handleDeleteJob = async () => {
    if (!deleteConfirm) return;
    await deleteJob(deleteConfirm.id);
    setDeleteConfirm(null);
    if (viewMode === 'kanban') {
      loadKanban();
    }
  };
  
  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    await updateJobStatus(jobId, newStatus);
    loadKanban();
  };
  
  const handleAddJob = (status?: JobStatus) => {
    if (status) {
      router.push(`/jobs/new?status=${status}`);
    } else {
      router.push('/jobs/new');
    }
  };
  
  const handleFiltersChange = (newFilters: JobFilters) => {
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFiltersChange({ ...filters, search: searchValue });
  };
  
  const handleStatusFilter = (status: JobStatus) => {
    const currentStatuses = Array.isArray(filters.status) 
      ? filters.status 
      : filters.status ? [filters.status] : [];
    
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    handleFiltersChange({ 
      ...filters, 
      status: newStatuses.length ? newStatuses : undefined 
    });
  };
  
  const clearFilters = () => {
    setSearchValue('');
    handleFiltersChange({});
  };
  
  const hasActiveFilters = filters.search || filters.status || filters.priority;
  const activeFilterCount = [
    filters.status && (Array.isArray(filters.status) ? filters.status.length : 1),
    filters.priority && (Array.isArray(filters.priority) ? filters.priority.length : 1),
  ].filter(Boolean).reduce((a, b) => (a || 0) + (b || 0), 0) || 0;
  
  return (
    <Layout isAuthenticated={true} noPadding>
      <div className="bg-[#0a0a0f] min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                <FolderKanban className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Jobs</h1>
                <p className="text-sm text-gray-500">Track and manage your work orders</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => viewMode === 'kanban' ? loadKanban() : refresh()}
                disabled={loading || kanbanLoading}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={cn("w-5 h-5", (loading || kanbanLoading) && "animate-spin")} />
              </button>
              
              {/* View Mode Toggle */}
              <div className="flex items-center bg-[#1C1C1C] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={cn(
                    "p-2 rounded-md transition-colors flex items-center gap-1.5",
                    viewMode === 'kanban' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  <Columns className="w-4 h-4" />
                  <span className="text-sm">Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 rounded-md transition-colors flex items-center gap-1.5",
                    viewMode === 'grid' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="text-sm">Grid</span>
                </button>
              </div>
              
              <button
                onClick={() => handleAddJob()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl shadow-lg shadow-purple-500/25 transition-all transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                New Job
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-full mx-auto px-6 py-8">
        {/* Filters (Grid View Only) */}
        {viewMode === 'grid' && (
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search jobs..."
                  className="w-full pl-12 pr-4 py-3 bg-[#1C1C1C] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </form>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                  showFilters || activeFilterCount > 0
                    ? "bg-purple-500/20 border-purple-500/30 text-purple-400"
                    : "bg-[#1C1C1C] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                )}
              >
                <Filter className="w-5 h-5" />
                <span className="text-sm font-medium">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-purple-500 text-white rounded-full">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {/* Results Count */}
            {pagination && (
              <p className="text-sm text-gray-500">
                {pagination.total} {pagination.total === 1 ? 'job' : 'jobs'} found
              </p>
            )}
            
            {/* Filter Panel */}
            {showFilters && (
              <div className="p-5 bg-[#1C1C1C]/80 backdrop-blur-sm border border-white/10 rounded-xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Status</h4>
                  <div className="flex flex-wrap gap-2">
                    {KANBAN_COLUMNS.map(({ status, label }) => {
                      const isSelected = Array.isArray(filters.status)
                        ? filters.status.includes(status)
                        : filters.status === status;
                      
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusFilter(status)}
                          className={cn(
                            "px-3 py-1.5 text-sm rounded-lg border transition-all",
                            isSelected
                              ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                              : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}
        
        {/* Loading State */}
        {(loading || kanbanLoading) && jobs.length === 0 && kanbanColumns.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        )}
        
        {/* Kanban View */}
        {viewMode === 'kanban' && (
          kanbanColumns.length > 0 || !kanbanLoading ? (
            <KanbanBoard
              columns={kanbanColumns}
              onJobClick={handleViewJob}
              onJobEdit={handleEditJob}
              onJobDelete={(job) => setDeleteConfirm(job)}
              onStatusChange={handleStatusChange}
              onAddJob={handleAddJob}
            />
          ) : null
        )}
        
        {/* Grid View */}
        {viewMode === 'grid' && (
          <>
            {/* Empty State */}
            {!loading && jobs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 bg-gray-500/10 rounded-full mb-4">
                  <FolderKanban className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No jobs yet</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Start tracking your work by creating your first job.
                </p>
                <button
                  onClick={() => handleAddJob()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Job
                </button>
              </div>
            )}
            
            {/* Jobs Grid */}
            {jobs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onView={handleViewJob}
                    onEdit={handleEditJob}
                    onDelete={(j) => setDeleteConfirm(j)}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setPage(page)}
                    className={cn(
                      "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                      page === pagination.page
                        ? "bg-purple-600 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-[#1C1C1C] border border-white/10 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Job</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">{deleteConfirm.title}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}
