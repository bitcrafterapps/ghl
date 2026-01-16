'use client';

import { useState } from 'react';
import type { Job, CreateJobDTO, JobStatus, JobPriority } from '@/types/jobs';
import { cn } from '@/lib/utils';
import { X, Loader2, Calendar, Clock, DollarSign, MapPin } from 'lucide-react';

interface JobFormProps {
  job?: Job | null;
  initialStatus?: JobStatus;
  contactId?: string;
  onSubmit: (data: CreateJobDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'on_hold', label: 'On Hold' },
];

const PRIORITY_OPTIONS: { value: JobPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const SERVICE_TYPES = [
  'General Repair',
  'Installation',
  'Maintenance',
  'Inspection',
  'Emergency Service',
  'Consultation',
  'Other',
];

export function JobForm({ job, initialStatus, contactId, onSubmit, onCancel, isLoading }: JobFormProps) {
  const [formData, setFormData] = useState<CreateJobDTO>({
    contactId: job?.contactId || contactId || '',
    title: job?.title || '',
    description: job?.description || '',
    serviceType: job?.serviceType || '',
    status: job?.status || initialStatus || 'lead',
    priority: job?.priority || 'normal',
    scheduledDate: job?.scheduledDate ? new Date(job.scheduledDate).toISOString().slice(0, 16) : '',
    scheduledEndDate: job?.scheduledEndDate ? new Date(job.scheduledEndDate).toISOString().slice(0, 16) : '',
    estimatedDuration: job?.estimatedDuration || undefined,
    estimatedAmount: job?.estimatedAmount || undefined,
    siteAddressLine1: job?.siteAddressLine1 || '',
    siteAddressLine2: job?.siteAddressLine2 || '',
    siteCity: job?.siteCity || '',
    siteState: job?.siteState || '',
    siteZip: job?.siteZip || '',
    notes: job?.notes || '',
    tags: job?.tags || [],
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags?.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), newTag] }));
      }
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) }));
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    if (formData.scheduledDate && formData.scheduledEndDate) {
      if (new Date(formData.scheduledDate) > new Date(formData.scheduledEndDate)) {
        newErrors.scheduledEndDate = 'End date must be after start date';
      }
    }
    
    if (formData.siteState && formData.siteState.length !== 2) {
      newErrors.siteState = 'State must be 2 characters';
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
  
  const inputClasses = "w-full px-4 py-2.5 bg-[#1C1C1C] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1.5";
  const errorClasses = "text-xs text-red-400 mt-1";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0a0a0f] border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {job ? 'Edit Job' : 'New Job'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">1</span>
              Job Details
            </h3>
            
            <div>
              <label htmlFor="title" className={labelClasses}>Job Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={cn(inputClasses, errors.title && 'border-red-500/50')}
                placeholder="e.g., Kitchen Remodel, HVAC Repair"
              />
              {errors.title && <p className={errorClasses}>{errors.title}</p>}
            </div>
            
            <div>
              <label htmlFor="description" className={labelClasses}>Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={inputClasses}
                placeholder="Describe the work to be done..."
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="serviceType" className={labelClasses}>Service Type</label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="">Select type</option>
                  {SERVICE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
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
              
              <div>
                <label htmlFor="priority" className={labelClasses}>Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">2</span>
              <Calendar className="w-4 h-4" />
              Scheduling
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="scheduledDate" className={labelClasses}>Start Date/Time</label>
                <input
                  type="datetime-local"
                  id="scheduledDate"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
              
              <div>
                <label htmlFor="scheduledEndDate" className={labelClasses}>End Date/Time</label>
                <input
                  type="datetime-local"
                  id="scheduledEndDate"
                  name="scheduledEndDate"
                  value={formData.scheduledEndDate}
                  onChange={handleChange}
                  className={cn(inputClasses, errors.scheduledEndDate && 'border-red-500/50')}
                />
                {errors.scheduledEndDate && <p className={errorClasses}>{errors.scheduledEndDate}</p>}
              </div>
              
              <div>
                <label htmlFor="estimatedDuration" className={labelClasses}>Duration (minutes)</label>
                <input
                  type="number"
                  id="estimatedDuration"
                  name="estimatedDuration"
                  value={formData.estimatedDuration || ''}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="120"
                  min="0"
                />
              </div>
            </div>
          </div>
          
          {/* Financials */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">3</span>
              <DollarSign className="w-4 h-4" />
              Financials
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="estimatedAmount" className={labelClasses}>Estimated Amount ($)</label>
                <input
                  type="number"
                  id="estimatedAmount"
                  name="estimatedAmount"
                  value={formData.estimatedAmount || ''}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="1500.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          
          {/* Site Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">4</span>
              <MapPin className="w-4 h-4" />
              Job Site Address
            </h3>
            
            <div>
              <label htmlFor="siteAddressLine1" className={labelClasses}>Address Line 1</label>
              <input
                type="text"
                id="siteAddressLine1"
                name="siteAddressLine1"
                value={formData.siteAddressLine1}
                onChange={handleChange}
                className={inputClasses}
                placeholder="123 Main St"
              />
            </div>
            
            <div>
              <label htmlFor="siteAddressLine2" className={labelClasses}>Address Line 2</label>
              <input
                type="text"
                id="siteAddressLine2"
                name="siteAddressLine2"
                value={formData.siteAddressLine2}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Suite 100"
              />
            </div>
            
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-2">
                <label htmlFor="siteCity" className={labelClasses}>City</label>
                <input
                  type="text"
                  id="siteCity"
                  name="siteCity"
                  value={formData.siteCity}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="San Francisco"
                />
              </div>
              
              <div className="col-span-2">
                <label htmlFor="siteState" className={labelClasses}>State</label>
                <input
                  type="text"
                  id="siteState"
                  name="siteState"
                  value={formData.siteState}
                  onChange={handleChange}
                  className={cn(inputClasses, errors.siteState && 'border-red-500/50')}
                  placeholder="CA"
                  maxLength={2}
                />
                {errors.siteState && <p className={errorClasses}>{errors.siteState}</p>}
              </div>
              
              <div className="col-span-2">
                <label htmlFor="siteZip" className={labelClasses}>ZIP</label>
                <input
                  type="text"
                  id="siteZip"
                  name="siteZip"
                  value={formData.siteZip}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="94105"
                />
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Tags</h3>
            
            <div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className={inputClasses}
                placeholder="Type a tag and press Enter"
              />
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-purple-500/20 text-purple-400 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="p-0.5 hover:bg-purple-500/30 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Notes</h3>
            
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className={inputClasses}
              placeholder="Add any internal notes about this job..."
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
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {job ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
