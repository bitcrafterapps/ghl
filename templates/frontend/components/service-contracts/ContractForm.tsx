'use client';

import { useState, useEffect } from 'react';
import type { 
  ServiceContract, 
  CreateServiceContractDTO, 
  ContractStatus, 
  BillingFrequency, 
  ServiceFrequency 
} from '@/types/service-contracts';
import { BILLING_FREQUENCY_LABELS, SERVICE_FREQUENCY_LABELS } from '@/types/service-contracts';
import { useContacts } from '@/hooks/useContacts';
import { cn } from '@/lib/utils';
import { X, Loader2, Calendar, DollarSign, Clock, Bell, User } from 'lucide-react';

interface ContractFormProps {
  contract?: ServiceContract | null;
  onSubmit: (data: CreateServiceContractDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const STATUS_OPTIONS: { value: ContractStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'expired', label: 'Expired' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'pending_renewal', label: 'Pending Renewal' },
];

const BILLING_OPTIONS: { value: BillingFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
];

const SERVICE_OPTIONS: { value: ServiceFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi_annual', label: 'Semi-Annual' },
  { value: 'annual', label: 'Annual' },
  { value: 'on_demand', label: 'On Demand' },
];

export function ContractForm({ contract, onSubmit, onCancel, isLoading, error }: ContractFormProps) {
  const { contacts, fetchContacts: fetchContactsList } = useContacts();

  useEffect(() => {
    // Fetch contacts for the select dropdown
    fetchContactsList({}, { page: 1, limit: 100 });
  }, []);

  const [formData, setFormData] = useState<CreateServiceContractDTO>({
    contactId: contract?.contactId || '',
    title: contract?.title || '',
    description: contract?.description || '',
    serviceType: contract?.serviceType || '',
    serviceFrequency: contract?.serviceFrequency || 'monthly',
    servicesIncluded: contract?.servicesIncluded || [],
    status: contract?.status || 'draft',
    startDate: contract?.startDate 
      ? new Date(contract.startDate).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    endDate: contract?.endDate 
      ? new Date(contract.endDate).toISOString().split('T')[0] 
      : '',
    billingFrequency: contract?.billingFrequency || 'monthly',
    amount: contract?.amount || 0,
    autoRenew: contract?.autoRenew || false,
    renewalReminderDays: contract?.renewalReminderDays || 30,
    terms: contract?.terms || '',
    notes: contract?.notes || '',
  });
  
  const [servicesInput, setServicesInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value ? Number(value) : 0) : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleAddService = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && servicesInput.trim()) {
      e.preventDefault();
      if (!formData.servicesIncluded?.includes(servicesInput.trim())) {
        setFormData(prev => ({
          ...prev,
          servicesIncluded: [...(prev.servicesIncluded || []), servicesInput.trim()]
        }));
      }
      setServicesInput('');
    }
  };
  
  const handleRemoveService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      servicesIncluded: prev.servicesIncluded?.filter(s => s !== service)
    }));
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Contract title is required';
    }
    if (!formData.serviceType?.trim()) {
      newErrors.serviceType = 'Service type is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Valid amount is required';
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
  
  const inputClasses = "w-full px-4 py-2.5 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";
  const errorClasses = "text-xs text-red-500 dark:text-red-400 mt-1";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-[#0a0a0f] border-b border-gray-200 dark:border-white/10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {contract ? 'Edit Contract' : 'New Service Contract'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs">1</span>
              Contract Details
            </h3>
            
            {/* Client (New) */}
            <div>
              <label htmlFor="contactId" className={labelClasses}>Client</label>
              <select
                id="contactId"
                name="contactId"
                value={formData.contactId}
                onChange={handleChange}
                className={inputClasses}
              >
                <option value="">Select Client</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName} {contact.contactCompanyName ? `(${contact.contactCompanyName})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="title" className={labelClasses}>Contract Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={cn(inputClasses, errors.title && 'border-red-500/50')}
                placeholder="e.g., Annual Maintenance Contract"
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
                rows={2}
                className={inputClasses}
                placeholder="Brief description of the contract"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="serviceType" className={labelClasses}>Service Type *</label>
                <input
                  type="text"
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className={cn(inputClasses, errors.serviceType && 'border-red-500/50')}
                  placeholder="e.g., HVAC Maintenance"
                />
                {errors.serviceType && <p className={errorClasses}>{errors.serviceType}</p>}
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
          </div>
          
          {/* Services Included */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Services Included</h3>
            
            <div>
              <input
                type="text"
                value={servicesInput}
                onChange={(e) => setServicesInput(e.target.value)}
                onKeyDown={handleAddService}
                className={inputClasses}
                placeholder="Type a service and press Enter"
              />
              {formData.servicesIncluded && formData.servicesIncluded.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.servicesIncluded.map((service, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 rounded-full"
                    >
                      {service}
                      <button
                        type="button"
                        onClick={() => handleRemoveService(service)}
                        className="p-0.5 hover:bg-teal-200 dark:hover:bg-teal-500/30 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="startDate" className={labelClasses}>Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={cn(inputClasses, errors.startDate && 'border-red-500/50')}
                />
                {errors.startDate && <p className={errorClasses}>{errors.startDate}</p>}
              </div>
              
              <div>
                <label htmlFor="endDate" className={labelClasses}>End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
              
              <div>
                <label htmlFor="serviceFrequency" className={labelClasses}>Service Frequency</label>
                <select
                  id="serviceFrequency"
                  name="serviceFrequency"
                  value={formData.serviceFrequency}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  {SERVICE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Billing */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Billing
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className={labelClasses}>Amount ($) *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount || ''}
                  onChange={handleChange}
                  className={cn(inputClasses, errors.amount && 'border-red-500/50')}
                  placeholder="150.00"
                  min="0"
                  step="0.01"
                />
                {errors.amount && <p className={errorClasses}>{errors.amount}</p>}
              </div>
              
              <div>
                <label htmlFor="billingFrequency" className={labelClasses}>Billing Frequency</label>
                <select
                  id="billingFrequency"
                  name="billingFrequency"
                  value={formData.billingFrequency}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  {BILLING_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Renewal Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Renewal Settings
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    name="autoRenew"
                    checked={formData.autoRenew}
                    onChange={handleChange}
                    className="rounded bg-white dark:bg-[#1C1C1C] border-gray-300 dark:border-white/10 text-teal-500 focus:ring-teal-500/50"
                  />
                  Auto-renew contract
                </label>
              </div>
              
              <div>
                <label htmlFor="renewalReminderDays" className={labelClasses}>Reminder (days before)</label>
                <input
                  type="number"
                  id="renewalReminderDays"
                  name="renewalReminderDays"
                  value={formData.renewalReminderDays || 30}
                  onChange={handleChange}
                  className={inputClasses}
                  min="0"
                />
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Terms & Notes</h3>
            
            <div>
              <label htmlFor="terms" className={labelClasses}>Terms & Conditions</label>
              <textarea
                id="terms"
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                rows={3}
                className={inputClasses}
                placeholder="Contract terms and conditions..."
              />
            </div>
            
            <div>
              <label htmlFor="notes" className={labelClasses}>Internal Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className={inputClasses}
                placeholder="Internal notes..."
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {contract ? 'Update Contract' : 'Create Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
