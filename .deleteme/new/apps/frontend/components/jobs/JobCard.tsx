'use client';

import type { Job } from '@/types/jobs';
import { JOB_STATUS_COLORS, JOB_PRIORITY_COLORS } from '@/types/jobs';
import { cn } from '@/lib/utils';
import { Calendar, Clock, DollarSign, MapPin, User, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface JobCardProps {
  job: Job;
  onView?: (job: Job) => void;
  onEdit?: (job: Job) => void;
  onDelete?: (job: Job) => void;
  compact?: boolean;
}

export function JobCard({ job, onView, onEdit, onDelete, compact = false }: JobCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const statusColors = JOB_STATUS_COLORS[job.status];
  const priorityColors = JOB_PRIORITY_COLORS[job.priority];
  
  const contactName = job.contact 
    ? [job.contact.firstName, job.contact.lastName].filter(Boolean).join(' ')
    : null;
  
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  if (compact) {
    return (
      <div 
        onClick={() => onView?.(job)}
        className="group p-3 bg-white dark:bg-[#1C1C1C]/80 rounded-lg border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-[#1C1C1C] transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {job.title}
            </p>
            {contactName && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{contactName}</p>
            )}
          </div>
          <span className={cn(
            'flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded border',
            priorityColors.bg,
            priorityColors.text,
            priorityColors.border
          )}>
            {priorityColors.label}
          </span>
        </div>
        {job.scheduledDate && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(job.scheduledDate)}</span>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="group relative bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/5 p-5 transition-all duration-300 hover:border-gray-300 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-[#1C1C1C] hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">{job.jobNumber}</span>
            <span className={cn(
              'px-2 py-0.5 text-[10px] font-medium rounded border',
              priorityColors.bg,
              priorityColors.text,
              priorityColors.border
            )}>
              {priorityColors.label}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
            {job.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-full border',
            statusColors.bg,
            statusColors.text,
            statusColors.border
          )}>
            {statusColors.label}
          </span>
          
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-white/10 shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {onView && (
                    <button
                      onClick={() => { onView(job); setMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => { onEdit(job); setMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => { onDelete(job); setMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Contact */}
      {contactName && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
          <User className="w-4 h-4" />
          <span>{contactName}</span>
        </div>
      )}
      
      {/* Description */}
      {job.description && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{job.description}</p>
      )}
      
      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {job.scheduledDate && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span>{formatDate(job.scheduledDate)}</span>
          </div>
        )}
        
        {job.estimatedDuration && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <span>{Math.floor(job.estimatedDuration / 60)}h {job.estimatedDuration % 60}m</span>
          </div>
        )}
        
        {job.estimatedAmount && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <DollarSign className="w-4 h-4 text-green-500 dark:text-green-400" />
            <span>{formatCurrency(job.estimatedAmount)}</span>
          </div>
        )}
        
        {job.siteCity && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <MapPin className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            <span>{job.siteCity}, {job.siteState}</span>
          </div>
        )}
      </div>
      
      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
          {job.tags.slice(0, 3).map(tag => (
            <span 
              key={tag}
              className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
              +{job.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
