// Contact Types
export type ContactStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'converted';
export type ContactSource = 'website' | 'referral' | 'social' | 'advertising' | 'cold_call' | 'event' | 'ghl' | 'manual' | 'other';

export interface Contact {
  id: string;
  companyId: number;
  
  // GHL Integration
  ghlContactId?: string;
  syncWithGhl?: boolean;
  
  // Basic Info
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneSecondary?: string;
  
  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  
  // Organization
  contactCompanyName?: string;
  contactJobTitle?: string;
  
  // CRM Fields
  status: ContactStatus;
  source: ContactSource;
  tags?: string[];
  customFields?: Record<string, any>;
  notes?: string;
  
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateContactDTO {
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  phoneSecondary?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  contactCompanyName?: string;
  contactJobTitle?: string;
  status?: ContactStatus;
  source?: ContactSource;
  tags?: string[];
  customFields?: Record<string, any>;
  notes?: string;
}

export interface UpdateContactDTO extends Partial<CreateContactDTO> {}

export interface ContactFilters {
  search?: string;
  status?: ContactStatus | ContactStatus[];
  source?: ContactSource | ContactSource[];
  tags?: string[];
}

// Contact Activity
export type ContactActivityType = 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'task' | 'other';

export interface ContactActivity {
  id: string;
  contactId: string;
  userId: number;
  type: ContactActivityType;
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

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Status Colors for UI
export const CONTACT_STATUS_COLORS: Record<ContactStatus, { bg: string; text: string; border: string }> = {
  new: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  contacted: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  qualified: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  proposal: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  negotiation: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  won: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  lost: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  converted: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
};

export const SOURCE_LABELS: Record<ContactSource, string> = {
  website: 'Website',
  referral: 'Referral',
  social: 'Social Media',
  advertising: 'Advertising',
  cold_call: 'Cold Call',
  event: 'Event',
  ghl: 'GoHighLevel',
  manual: 'Manual Entry',
  other: 'Other',
};
