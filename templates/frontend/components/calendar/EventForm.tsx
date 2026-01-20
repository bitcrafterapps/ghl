'use client';

import { useState } from 'react';
import type { CalendarEvent, CreateCalendarEventDTO, CalendarEventType, CalendarEventStatus, RecurrenceFrequency } from '@/types/calendar';
import { EVENT_TYPE_COLORS } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { X, Loader2, Calendar, Clock, MapPin, Video, Bell, Repeat } from 'lucide-react';

interface EventFormProps {
  event?: CalendarEvent | null;
  initialDate?: Date;
  onSubmit: (data: CreateCalendarEventDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EVENT_TYPES: { value: CalendarEventType; label: string }[] = [
  { value: 'appointment', label: 'Appointment' },
  { value: 'job', label: 'Job' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS: { value: CalendarEventStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

const RECURRENCE_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const REMINDER_OPTIONS = [
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

export function EventForm({ event, initialDate, onSubmit, onCancel, isLoading }: EventFormProps) {
  const defaultStart = event?.startTime 
    ? new Date(event.startTime).toISOString().slice(0, 16)
    : initialDate 
      ? new Date(initialDate.getTime() - initialDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);
  
  const defaultEnd = event?.endTime
    ? new Date(event.endTime).toISOString().slice(0, 16)
    : initialDate
      ? new Date(initialDate.getTime() + 60 * 60 * 1000 - initialDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      : new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
  
  const [formData, setFormData] = useState<CreateCalendarEventDTO>({
    title: event?.title || '',
    description: event?.description || '',
    eventType: event?.eventType || 'appointment',
    status: event?.status || 'scheduled',
    startTime: defaultStart,
    endTime: defaultEnd,
    allDay: event?.allDay || false,
    location: event?.location || '',
    locationAddress: event?.locationAddress || '',
    isVirtual: event?.isVirtual || false,
    virtualMeetingUrl: event?.virtualMeetingUrl || '',
    isRecurring: event?.isRecurring || false,
    recurrenceFrequency: event?.recurrenceFrequency || 'weekly',
    sendReminder: event?.sendReminder || true,
    reminderMinutesBefore: event?.reminderMinutesBefore || 30,
    color: event?.color || '',
    notes: event?.notes || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Event title is required';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    
    if (formData.startTime && formData.endTime) {
      if (new Date(formData.startTime) >= new Date(formData.endTime)) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData);
    }
  };
  
  const inputClasses = "w-full px-4 py-2.5 bg-[#1C1C1C] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1.5";
  const errorClasses = "text-xs text-red-400 mt-1";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0a0a0f] border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {event ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className={labelClasses}>Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={cn(inputClasses, errors.title && 'border-red-500/50')}
              placeholder="e.g., Site Inspection, Client Meeting"
            />
            {errors.title && <p className={errorClasses}>{errors.title}</p>}
          </div>
          
          {/* Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="eventType" className={labelClasses}>Type</label>
              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className={inputClasses}
              >
                {EVENT_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className={labelClasses}>Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClasses}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Date/Time */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-gray-300">Date & Time</span>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  name="allDay"
                  checked={formData.allDay}
                  onChange={handleChange}
                  className="rounded bg-[#1C1C1C] border-white/10 text-cyan-500 focus:ring-cyan-500/50"
                />
                All Day
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className={labelClasses}>Start *</label>
                <input
                  type={formData.allDay ? 'date' : 'datetime-local'}
                  id="startTime"
                  name="startTime"
                  value={formData.allDay ? formData.startTime.split('T')[0] : formData.startTime}
                  onChange={handleChange}
                  className={cn(inputClasses, errors.startTime && 'border-red-500/50')}
                />
                {errors.startTime && <p className={errorClasses}>{errors.startTime}</p>}
              </div>
              
              <div>
                <label htmlFor="endTime" className={labelClasses}>End *</label>
                <input
                  type={formData.allDay ? 'date' : 'datetime-local'}
                  id="endTime"
                  name="endTime"
                  value={formData.allDay ? formData.endTime.split('T')[0] : formData.endTime}
                  onChange={handleChange}
                  className={cn(inputClasses, errors.endTime && 'border-red-500/50')}
                />
                {errors.endTime && <p className={errorClasses}>{errors.endTime}</p>}
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-gray-300">Location</span>
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  name="isVirtual"
                  checked={formData.isVirtual}
                  onChange={handleChange}
                  className="rounded bg-[#1C1C1C] border-white/10 text-cyan-500 focus:ring-cyan-500/50"
                />
                <Video className="w-4 h-4" />
                Virtual Meeting
              </label>
            </div>
            
            {formData.isVirtual ? (
              <div>
                <label htmlFor="virtualMeetingUrl" className={labelClasses}>Meeting URL</label>
                <input
                  type="url"
                  id="virtualMeetingUrl"
                  name="virtualMeetingUrl"
                  value={formData.virtualMeetingUrl}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            ) : (
              <div>
                <label htmlFor="location" className={labelClasses}>Location Name</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Client's Office, Job Site, etc."
                />
              </div>
            )}
          </div>
          
          {/* Recurring */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  className="rounded bg-[#1C1C1C] border-white/10 text-cyan-500 focus:ring-cyan-500/50"
                />
                <Repeat className="w-4 h-4" />
                Recurring Event
              </label>
            </div>
            
            {formData.isRecurring && (
              <div>
                <label htmlFor="recurrenceFrequency" className={labelClasses}>Repeat</label>
                <select
                  id="recurrenceFrequency"
                  name="recurrenceFrequency"
                  value={formData.recurrenceFrequency}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  {RECURRENCE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Reminder */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  name="sendReminder"
                  checked={formData.sendReminder}
                  onChange={handleChange}
                  className="rounded bg-[#1C1C1C] border-white/10 text-cyan-500 focus:ring-cyan-500/50"
                />
                <Bell className="w-4 h-4" />
                Send Reminder
              </label>
            </div>
            
            {formData.sendReminder && (
              <div>
                <label htmlFor="reminderMinutesBefore" className={labelClasses}>When</label>
                <select
                  id="reminderMinutesBefore"
                  name="reminderMinutesBefore"
                  value={formData.reminderMinutesBefore}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  {REMINDER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClasses}>Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={inputClasses}
              placeholder="Add details about this event..."
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
