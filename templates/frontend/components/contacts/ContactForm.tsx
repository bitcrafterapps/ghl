'use client';

import { useState } from 'react';
import type { Contact, CreateContactDTO, ContactStatus, ContactSource } from '@/types/contacts';
import { cn } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';

interface ContactFormProps {
  contact?: Contact | null;
  onSubmit: (data: CreateContactDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const STATUS_OPTIONS: { value: ContactStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const SOURCE_OPTIONS: { value: ContactSource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social Media' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'event', label: 'Event' },
  { value: 'manual', label: 'Manual Entry' },
  { value: 'other', label: 'Other' },
];

export function ContactForm({ contact, onSubmit, onCancel, isLoading }: ContactFormProps) {
  const [formData, setFormData] = useState<CreateContactDTO>({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    phoneSecondary: contact?.phoneSecondary || '',
    addressLine1: contact?.addressLine1 || '',
    addressLine2: contact?.addressLine2 || '',
    city: contact?.city || '',
    state: contact?.state || '',
    zip: contact?.zip || '',
    country: contact?.country || 'USA',
    contactCompanyName: contact?.contactCompanyName || '',
    contactJobTitle: contact?.contactJobTitle || '',
    status: contact?.status || 'new',
    source: contact?.source || 'manual',
    tags: contact?.tags || [],
    notes: contact?.notes || '',
  });
  
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.state && formData.state.length !== 2) {
      newErrors.state = 'State must be 2 characters';
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
  
  const inputClasses = "w-full px-4 py-2.5 bg-[#1C1C1C] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1.5";
  const errorClasses = "text-xs text-red-400 mt-1";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0a0a0f] border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {contact ? 'Edit Contact' : 'New Contact'}
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
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={labelClasses}>First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={cn(inputClasses, errors.firstName && 'border-red-500/50')}
                  placeholder="John"
                />
                {errors.firstName && <p className={errorClasses}>{errors.firstName}</p>}
              </div>
              
              <div>
                <label htmlFor="lastName" className={labelClasses}>Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Doe"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className={labelClasses}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(inputClasses, errors.email && 'border-red-500/50')}
                  placeholder="john@example.com"
                />
                {errors.email && <p className={errorClasses}>{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="phone" className={labelClasses}>Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactCompanyName" className={labelClasses}>Company</label>
                <input
                  type="text"
                  id="contactCompanyName"
                  name="contactCompanyName"
                  value={formData.contactCompanyName}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Acme Inc."
                />
              </div>
              
              <div>
                <label htmlFor="contactJobTitle" className={labelClasses}>Job Title</label>
                <input
                  type="text"
                  id="contactJobTitle"
                  name="contactJobTitle"
                  value={formData.contactJobTitle}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="CEO"
                />
              </div>
            </div>
          </div>
          
          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Address</h3>
            
            <div>
              <label htmlFor="addressLine1" className={labelClasses}>Address Line 1</label>
              <input
                type="text"
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                className={inputClasses}
                placeholder="123 Main St"
              />
            </div>
            
            <div>
              <label htmlFor="addressLine2" className={labelClasses}>Address Line 2</label>
              <input
                type="text"
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className={inputClasses}
                placeholder="Suite 100"
              />
            </div>
            
            <div className="grid grid-cols-6 gap-4">
              <div className="col-span-2">
                <label htmlFor="city" className={labelClasses}>City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="San Francisco"
                />
              </div>
              
              <div className="col-span-2">
                <label htmlFor="state" className={labelClasses}>State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className={cn(inputClasses, errors.state && 'border-red-500/50')}
                  placeholder="CA"
                  maxLength={2}
                />
                {errors.state && <p className={errorClasses}>{errors.state}</p>}
              </div>
              
              <div className="col-span-2">
                <label htmlFor="zip" className={labelClasses}>ZIP</label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="94105"
                />
              </div>
            </div>
          </div>
          
          {/* Status & Source */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Status & Source</h3>
            
            <div className="grid grid-cols-2 gap-4">
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
                <label htmlFor="source" className={labelClasses}>Source</label>
                <select
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  {SOURCE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
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
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-blue-500/20 text-blue-400 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="p-0.5 hover:bg-blue-500/30 rounded-full"
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
              placeholder="Add any notes about this contact..."
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
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {contact ? 'Update Contact' : 'Create Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
