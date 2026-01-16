// Calendar Types
export type CalendarEventType = 'job' | 'appointment' | 'reminder' | 'follow_up' | 'site_visit' | 'consultation' | 'other';
export type CalendarEventStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  companyId: number;
  
  // Basic Info
  title: string;
  description?: string;
  eventType: CalendarEventType;
  status: CalendarEventStatus;
  
  // Timing
  startTime: Date | string;
  endTime: Date | string;
  allDay?: boolean;
  timezone?: string;
  
  // Recurrence
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceInterval?: number;
  recurrenceEndDate?: Date | string;
  parentEventId?: string;
  
  // Location
  location?: string;
  locationAddress?: string;
  isVirtual?: boolean;
  virtualMeetingUrl?: string;
  
  // Relations
  contactId?: string;
  jobId?: string;
  assignedUserIds?: number[];
  
  // Contact Info (populated)
  contact?: {
    id: string;
    firstName: string;
    lastName?: string;
    phone?: string;
  };
  
  // Job Info (populated)
  job?: {
    id: string;
    title: string;
    jobNumber: string;
  };
  
  // Reminders
  sendReminder?: boolean;
  reminderMinutesBefore?: number;
  
  // Colors
  color?: string;
  
  // Notes
  notes?: string;
  
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateCalendarEventDTO {
  title: string;
  description?: string;
  eventType?: CalendarEventType;
  status?: CalendarEventStatus;
  startTime: string;
  endTime: string;
  allDay?: boolean;
  location?: string;
  locationAddress?: string;
  isVirtual?: boolean;
  virtualMeetingUrl?: string;
  contactId?: string;
  jobId?: string;
  assignedUserIds?: number[];
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  sendReminder?: boolean;
  reminderMinutesBefore?: number;
  color?: string;
  notes?: string;
}

export interface UpdateCalendarEventDTO extends Partial<CreateCalendarEventDTO> {}

export interface CalendarEventFilters {
  startDate: string;
  endDate: string;
  eventType?: CalendarEventType;
  status?: CalendarEventStatus;
  contactId?: string;
  jobId?: string;
  assignedUserId?: number;
  expand?: boolean;
}

// View Types
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

// Event Type Colors
export const EVENT_TYPE_COLORS: Record<CalendarEventType, { bg: string; text: string; border: string; label: string }> = {
  job: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Job' },
  appointment: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Appointment' },
  reminder: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Reminder' },
  follow_up: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Follow-up' },
  site_visit: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Site Visit' },
  consultation: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'Consultation' },
  other: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Other' },
};

export const EVENT_STATUS_COLORS: Record<CalendarEventStatus, { bg: string; text: string; label: string }> = {
  scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Scheduled' },
  confirmed: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Confirmed' },
  in_progress: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'In Progress' },
  completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Completed' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' },
  rescheduled: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Rescheduled' },
};

// Helper to get all days in a month for calendar grid
export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Start from Sunday of the first week
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  // End on Saturday of the last week
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  const days: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

// Helper to get week days
export function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  
  return days;
}

// Format helpers
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}
