'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useJobs } from '@/hooks/useJobs';
import { JobForm } from '@/components/jobs/JobForm';
import type { Job, JobActivity, CreateJobDTO, JobStatus } from '@/types/jobs';
import { JOB_STATUS_COLORS, JOB_PRIORITY_COLORS, KANBAN_COLUMNS } from '@/types/jobs';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  User,
  Edit,
  Trash2,
  Plus,
  MessageSquare,
  PhoneCall,
  Mail,
  FileText,
  CheckCircle,
  Loader2,
  Image,
  ChevronRight,
  ExternalLink,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  
  const { 
    getJob, 
    updateJob, 
    updateJobStatus,
    deleteJob, 
    getActivities, 
    addActivity 
  } = useJobs();
  
  const [job, setJob] = useState<Job | null>(null);
  const [activities, setActivities] = useState<JobActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(isEditMode);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [activityType, setActivityType] = useState<string>('note');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  
  useEffect(() => {
    loadJob();
    loadActivities();
  }, [id]);
  
  const loadJob = async () => {
    setLoading(true);
    const data = await getJob(id);
    setJob(data);
    setLoading(false);
  };
  
  const loadActivities = async () => {
    const data = await getActivities(id);
    setActivities(data);
  };
  
  const handleUpdate = async (data: CreateJobDTO) => {
    setFormLoading(true);
    try {
      const updated = await updateJob(id, data);
      if (updated) {
        setJob(updated);
      }
      setShowEditForm(false);
      router.replace(`/jobs/${id}`);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleStatusChange = async (newStatus: JobStatus) => {
    const updated = await updateJobStatus(id, newStatus);
    if (updated) {
      setJob(updated);
      await loadActivities(); // Reload activities to show status change
    }
    setStatusMenuOpen(false);
  };
  
  const handleDelete = async () => {
    const success = await deleteJob(id);
    if (success) {
      router.push('/jobs');
    }
  };
  
  const handleAddActivity = async () => {
    if (!activityTitle.trim()) return;
    
    const activity = await addActivity(id, {
      type: activityType as any,
      title: activityTitle,
      description: activityDescription || undefined,
    });
    
    if (activity) {
      setActivities(prev => [activity, ...prev]);
      setShowAddActivity(false);
      setActivityTitle('');
      setActivityDescription('');
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <PhoneCall className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'status_change': return <CheckCircle className="w-4 h-4" />;
      case 'photo_upload': return <Image className="w-4 h-4" />;
      case 'invoice': return <Receipt className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };
  
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const formatTime = (date: Date | string | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };
  
  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-bold text-white mb-2">Job Not Found</h2>
        <p className="text-gray-500 mb-6">The job you're looking for doesn't exist or has been deleted.</p>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
      </div>
    );
  }
  
  const statusColors = JOB_STATUS_COLORS[job.status];
  const priorityColors = JOB_PRIORITY_COLORS[job.priority];
  const contactName = job.contact 
    ? [job.contact.firstName, job.contact.lastName].filter(Boolean).join(' ')
    : null;
  
  const fullAddress = [
    job.siteAddressLine1,
    job.siteAddressLine2,
    [job.siteCity, job.siteState].filter(Boolean).join(', '),
    job.siteZip,
  ].filter(Boolean).join('\n');
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/jobs"
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div>
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
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                  
                  {/* Status Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-full border flex items-center gap-1.5 transition-colors',
                        statusColors.bg,
                        statusColors.text,
                        statusColors.border,
                        'hover:opacity-80'
                      )}
                    >
                      {statusColors.label}
                      <ChevronRight className={cn("w-3 h-3 transition-transform", statusMenuOpen && "rotate-90")} />
                    </button>
                    
                    {statusMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setStatusMenuOpen(false)} 
                        />
                        <div className="absolute left-0 top-10 z-20 w-40 bg-[#2A2A2A] rounded-lg border border-white/10 shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                          {KANBAN_COLUMNS.map(({ status, label }) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(status)}
                              className={cn(
                                "w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2",
                                job.status === status
                                  ? "text-purple-400 bg-purple-500/10"
                                  : "text-gray-300 hover:text-white hover:bg-white/5"
                              )}
                            >
                              <span className={cn(
                                "w-2 h-2 rounded-full",
                                JOB_STATUS_COLORS[status].bg.replace('/20', '')
                              )} />
                              {label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {job.description && (
              <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 p-6">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
              </div>
            )}
            
            {/* Schedule & Details */}
            <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 p-6">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Schedule & Details</h3>
              
              <div className="grid grid-cols-2 gap-6">
                {job.scheduledDate && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Calendar className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Scheduled</p>
                      <p className="text-sm text-white">{formatDate(job.scheduledDate)}</p>
                      <p className="text-xs text-gray-400">{formatTime(job.scheduledDate)}</p>
                    </div>
                  </div>
                )}
                
                {job.estimatedDuration && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Clock className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm text-white">{formatDuration(job.estimatedDuration)}</p>
                    </div>
                  </div>
                )}
                
                {job.serviceType && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Service Type</p>
                      <p className="text-sm text-white">{job.serviceType}</p>
                    </div>
                  </div>
                )}
                
                {fullAddress && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <MapPin className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Job Site</p>
                      <p className="text-sm text-white whitespace-pre-line">{fullAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Activity Feed */}
            <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-white">Activity</h3>
                <button
                  onClick={() => setShowAddActivity(!showAddActivity)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Activity
                </button>
              </div>
              
              {/* Add Activity Form */}
              {showAddActivity && (
                <div className="px-6 py-4 bg-[#0a0a0f]/50 border-b border-white/5">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {['note', 'call', 'email', 'invoice', 'payment'].map(type => (
                        <button
                          key={type}
                          onClick={() => setActivityType(type)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors",
                            activityType === type
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    
                    <input
                      type="text"
                      value={activityTitle}
                      onChange={(e) => setActivityTitle(e.target.value)}
                      placeholder="Activity title..."
                      className="w-full px-4 py-2 bg-[#1C1C1C] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    
                    <textarea
                      value={activityDescription}
                      onChange={(e) => setActivityDescription(e.target.value)}
                      placeholder="Add details (optional)..."
                      rows={3}
                      className="w-full px-4 py-2 bg-[#1C1C1C] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                    />
                    
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAddActivity(false)}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddActivity}
                        disabled={!activityTitle.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Add Activity
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Activity List */}
              <div className="divide-y divide-white/5">
                {activities.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">No activity recorded yet</p>
                  </div>
                ) : (
                  activities.map(activity => (
                    <div key={activity.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-2 rounded-lg",
                          activity.type === 'status_change' ? "bg-green-500/10" :
                          activity.type === 'call' ? "bg-blue-500/10" :
                          activity.type === 'email' ? "bg-purple-500/10" :
                          activity.type === 'invoice' ? "bg-yellow-500/10" :
                          activity.type === 'payment' ? "bg-green-500/10" :
                          activity.type === 'photo_upload' ? "bg-pink-500/10" :
                          "bg-gray-500/10"
                        )}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{activity.title}</p>
                          {activity.description && (
                            <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            {activity.user && (
                              <span>{activity.user.firstName} {activity.user.lastName}</span>
                            )}
                            <span>•</span>
                            <span>{new Date(activity.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Notes */}
            {job.notes && (
              <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 p-6">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Internal Notes</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{job.notes}</p>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Financials */}
            <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 p-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Financials</h3>
              
              <div className="space-y-3">
                {job.estimatedAmount && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Estimated</span>
                    <span className="text-lg font-semibold text-white">{formatCurrency(job.estimatedAmount)}</span>
                  </div>
                )}
                {job.actualAmount && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Actual</span>
                    <span className="text-lg font-semibold text-green-400">{formatCurrency(job.actualAmount)}</span>
                  </div>
                )}
                {job.depositAmount && (
                  <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-gray-500">Deposit</span>
                    <div className="text-right">
                      <span className="text-sm text-white">{formatCurrency(job.depositAmount)}</span>
                      <span className={cn(
                        "ml-2 text-xs px-2 py-0.5 rounded",
                        job.depositPaid 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-yellow-500/20 text-yellow-400"
                      )}>
                        {job.depositPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contact */}
            {job.contact && (
              <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 p-6 space-y-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Contact</h3>
                
                <Link
                  href={`/contacts/${job.contact.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {job.contact.firstName[0]}{job.contact.lastName?.[0] || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                      {contactName}
                    </p>
                    {job.contact.email && (
                      <p className="text-xs text-gray-500 truncate">{job.contact.email}</p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
                </Link>
                
                {job.contact.phone && (
                  <a
                    href={`tel:${job.contact.phone}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    {job.contact.phone}
                  </a>
                )}
              </div>
            )}
            
            {/* Meta Info */}
            <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 p-6 space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Details</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-white">{formatDate(job.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated</span>
                  <span className="text-white">{formatDate(job.updatedAt)}</span>
                </div>
                {job.completedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed</span>
                    <span className="text-green-400">{formatDate(job.completedDate)}</span>
                  </div>
                )}
              </div>
              
              {job.tags && job.tags.length > 0 && (
                <div className="pt-3 border-t border-white/5">
                  <p className="text-xs text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 p-6 space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Quick Actions</h3>
              
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left">
                  <Image className="w-4 h-4 text-pink-400" />
                  <span className="text-sm text-white">Add Photos</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left">
                  <Receipt className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white">Create Invoice</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-white">Schedule Follow-up</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Form Modal */}
      {showEditForm && (
        <JobForm
          job={job}
          onSubmit={handleUpdate}
          onCancel={() => {
            setShowEditForm(false);
            router.replace(`/jobs/${id}`);
          }}
          isLoading={formLoading}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-[#1C1C1C] border border-white/10 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Job</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">{job.title}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
