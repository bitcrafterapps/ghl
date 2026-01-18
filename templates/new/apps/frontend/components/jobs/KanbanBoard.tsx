'use client';

import type { Job, JobStatus, KanbanColumn } from '@/types/jobs';
import { KANBAN_COLUMNS, JOB_STATUS_COLORS } from '@/types/jobs';
import { JobCard } from './JobCard';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onJobClick?: (job: Job) => void;
  onJobEdit?: (job: Job) => void;
  onJobDelete?: (job: Job) => void;
  onStatusChange?: (jobId: string, newStatus: JobStatus) => void;
  onAddJob?: (status: JobStatus) => void;
}

export function KanbanBoard({
  columns,
  onJobClick,
  onJobEdit,
  onJobDelete,
  onStatusChange,
  onAddJob,
}: KanbanBoardProps) {
  // Create a map for quick lookup
  const columnMap = new Map(columns.map(c => [c.status, c]));
  
  const handleDragStart = (e: React.DragEvent, job: Job) => {
    e.dataTransfer.setData('jobId', job.id);
    e.dataTransfer.setData('currentStatus', job.status);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent, targetStatus: JobStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    const currentStatus = e.dataTransfer.getData('currentStatus');
    
    if (currentStatus !== targetStatus && onStatusChange) {
      onStatusChange(jobId, targetStatus);
    }
  };
  
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {KANBAN_COLUMNS.map(({ status, label }) => {
        const column = columnMap.get(status);
        const jobs = column?.jobs || [];
        const statusColors = JOB_STATUS_COLORS[status];
        
        return (
          <div
            key={status}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div className={cn(
              "flex items-center justify-between px-4 py-3 rounded-t-xl border-t-2",
              "bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm border-x border-b-0 border-gray-200 dark:border-white/5",
              statusColors.border.replace('border-', 'border-t-'),
            )}>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  statusColors.bg.replace('/20', '')
                )} />
                <h3 className="font-medium text-gray-900 dark:text-white">{label}</h3>
                <span className="px-2 py-0.5 text-xs text-gray-500 bg-gray-100 dark:bg-white/5 rounded">
                  {jobs.length}
                </span>
              </div>
              
              {onAddJob && (
                <button
                  onClick={() => onAddJob(status)}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Column Body */}
            <div className="min-h-[400px] p-3 space-y-3 bg-gray-50 dark:bg-[#0a0a0f]/50 border border-gray-200 dark:border-white/5 rounded-b-xl">
              {jobs.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600 text-sm">
                  No jobs
                </div>
              ) : (
                jobs.map(job => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job)}
                    className="cursor-move"
                  >
                    <JobCard
                      job={job}
                      compact
                      onView={onJobClick}
                      onEdit={onJobEdit}
                      onDelete={onJobDelete}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
