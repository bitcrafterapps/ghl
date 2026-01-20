// Service Contract Types
export type ContractStatus = 'draft' | 'active' | 'paused' | 'expired' | 'cancelled' | 'pending_renewal';
export type BillingFrequency = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
export type ServiceFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'on_demand';

export interface ServiceContract {
  id: string;
  companyId: number;
  contactId?: string;
  
  // Contract Details
  contractNumber: string;
  title: string;
  description?: string;
  
  // Services
  serviceType: string;
  serviceFrequency: ServiceFrequency;
  servicesIncluded?: string[];
  
  // Status
  status: ContractStatus;
  
  // Dates
  startDate: Date | string;
  endDate?: Date | string;
  nextServiceDate?: Date | string;
  lastServiceDate?: Date | string;
  
  // Billing
  billingFrequency: BillingFrequency;
  amount: number;
  nextBillingDate?: Date | string;
  
  // Renewal
  autoRenew?: boolean;
  renewalReminderDays?: number;
  renewalNotificationSent?: boolean;
  
  // Notes
  terms?: string;
  notes?: string;
  
  // Relations
  contact?: {
    id: string;
    firstName: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateServiceContractDTO {
  contactId?: string;
  title: string;
  description?: string;
  serviceType: string;
  serviceFrequency: ServiceFrequency;
  servicesIncluded?: string[];
  status?: ContractStatus;
  startDate: string;
  endDate?: string;
  billingFrequency: BillingFrequency;
  amount: number;
  autoRenew?: boolean;
  renewalReminderDays?: number;
  terms?: string;
  notes?: string;
}

export interface UpdateServiceContractDTO extends Partial<CreateServiceContractDTO> {}

export interface ContractFilters {
  search?: string;
  status?: ContractStatus | ContractStatus[];
  contactId?: string;
  serviceType?: string;
  expiringWithinDays?: number;
}

// Status Colors
export const CONTRACT_STATUS_COLORS: Record<ContractStatus, { bg: string; text: string; border: string; label: string }> = {
  draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Draft' },
  active: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Active' },
  paused: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Paused' },
  expired: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Expired' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Cancelled' },
  pending_renewal: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Pending Renewal' },
};

export const BILLING_FREQUENCY_LABELS: Record<BillingFrequency, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  annual: 'Annual',
};

export const SERVICE_FREQUENCY_LABELS: Record<ServiceFrequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Every 2 Weeks',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  annual: 'Annual',
  on_demand: 'On Demand',
};
