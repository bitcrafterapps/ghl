// Job Types
export type JobStatus = 'lead' | 'quoted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Job {
  id: string;
  companyId: number;
  jobNumber: string;
  
  // Contact
  contactId?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  
  // Job Details
  title: string;
  description?: string;
  serviceType?: string;
  notes?: string;
  tags?: string[];
  
  // Status
  status: JobStatus;
  priority: JobPriority;
  
  // Scheduling
  scheduledDate?: Date | string;
  scheduledEndDate?: Date | string;
  completedDate?: Date | string;
  estimatedDuration?: number; // minutes
  
  // Financials
  estimatedAmount?: number;
  actualAmount?: number;
  depositAmount?: number;
  depositPaid?: boolean;
  
  // Address
  siteAddressLine1?: string;
  siteAddressLine2?: string;
  siteCity?: string;
  siteState?: string;
  siteZip?: string;
  
  // Assignments
  assignedUserIds?: number[];
  leadTechnicianId?: number;
  
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateJobDTO {
  contactId?: string;
  title: string;
  description?: string;
  serviceType?: string;
  status?: JobStatus;
  priority?: JobPriority;
  scheduledDate?: string;
  scheduledEndDate?: string;
  estimatedDuration?: number;
  estimatedAmount?: number;
  siteAddressLine1?: string;
  siteAddressLine2?: string;
  siteCity?: string;
  siteState?: string;
  siteZip?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateJobDTO extends Partial<CreateJobDTO> {}

export interface JobFilters {
  search?: string;
  status?: JobStatus | JobStatus[];
  priority?: JobPriority | JobPriority[];
  contactId?: string;
  assignedUserId?: number;
  serviceType?: string;
  scheduledDateStart?: string;
  scheduledDateEnd?: string;
  tags?: string[];
}

// Job Activity
export type JobActivityType = 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'photo_upload' | 'invoice' | 'payment' | 'other';

export interface JobActivity {
  id: string;
  jobId: string;
  userId: number;
  type: JobActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date | string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

// Kanban View
export interface KanbanColumn {
  status: JobStatus;
  label: string;
  jobs: Job[];
}

// Status Colors for UI
export const JOB_STATUS_COLORS: Record<JobStatus, { bg: string; text: string; border: string; label: string }> = {
  lead: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', label: 'Lead' },
  quoted: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Quoted' },
  scheduled: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Scheduled' },
  in_progress: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'In Progress' },
  completed: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Completed' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Cancelled' },
  on_hold: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'On Hold' },
};

export const JOB_PRIORITY_COLORS: Record<JobPriority, { bg: string; text: string; border: string; label: string }> = {
  low: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Low' },
  normal: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Normal' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'High' },
  urgent: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Urgent' },
};

export const KANBAN_COLUMNS: { status: JobStatus; label: string }[] = [
  { status: 'lead', label: 'Lead' },
  { status: 'quoted', label: 'Quoted' },
  { status: 'scheduled', label: 'Scheduled' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'completed', label: 'Completed' },
];
