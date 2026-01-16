'use client';

import { useState, useCallback } from 'react';
import type {
  Contact,
  CreateContactDTO,
  UpdateContactDTO,
  ContactFilters,
  ContactActivity,
  PaginationParams,
  PaginatedResponse,
} from '@/types/contacts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface UseContactsOptions {
  initialFilters?: ContactFilters;
  initialPagination?: PaginationParams;
}

interface ContactsState {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

interface ContactsActions {
  fetchContacts: (filters?: ContactFilters, pagination?: PaginationParams) => Promise<void>;
  getContact: (id: string) => Promise<Contact | null>;
  createContact: (data: CreateContactDTO) => Promise<Contact | null>;
  updateContact: (id: string, data: UpdateContactDTO) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<boolean>;
  getActivities: (contactId: string) => Promise<ContactActivity[]>;
  addActivity: (contactId: string, data: Partial<ContactActivity>) => Promise<ContactActivity | null>;
  setFilters: (filters: ContactFilters) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export function useContacts(options: UseContactsOptions = {}): ContactsState & ContactsActions {
  const [state, setState] = useState<ContactsState>({
    contacts: [],
    loading: false,
    error: null,
    pagination: null,
  });

  const [filters, setFilters] = useState<ContactFilters>(options.initialFilters || {});
  const [paginationParams, setPaginationParams] = useState<PaginationParams>(
    options.initialPagination || { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }
  );

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const buildQueryString = useCallback((filters: ContactFilters, pagination: PaginationParams): string => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      statuses.forEach(s => params.append('status', s));
    }
    if (filters.source) {
      const sources = Array.isArray(filters.source) ? filters.source : [filters.source];
      sources.forEach(s => params.append('source', s));
    }
    if (filters.tags?.length) params.append('tags', filters.tags.join(','));
    
    if (pagination.page) params.append('page', String(pagination.page));
    if (pagination.limit) params.append('limit', String(pagination.limit));
    if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
    
    return params.toString();
  }, []);

  const fetchContacts = useCallback(async (
    newFilters?: ContactFilters,
    newPagination?: PaginationParams
  ): Promise<void> => {
    const currentFilters = newFilters || filters;
    const currentPagination = newPagination || paginationParams;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const queryString = buildQueryString(currentFilters, currentPagination);
      const response = await fetch(`${API_BASE}/api/v1/contacts?${queryString}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch contacts');
      }
      
      const result = await response.json();
      const data = result.data as PaginatedResponse<Contact>;
      
      setState(prev => ({
        ...prev,
        contacts: data.data,
        pagination: data.pagination,
        loading: false,
      }));
      
      if (newFilters) setFilters(newFilters);
      if (newPagination) setPaginationParams(newPagination);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [filters, paginationParams, buildQueryString, getAuthHeaders]);

  const getContact = useCallback(async (id: string): Promise<Contact | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/contacts/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return null;
      }
      
      const result = await response.json();
      return result.data as Contact;
    } catch (error) {
      return null;
    }
  }, [getAuthHeaders]);

  const createContact = useCallback(async (data: CreateContactDTO): Promise<Contact | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/contacts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create contact');
      }
      
      const result = await response.json();
      const newContact = result.data as Contact;
      
      // Refresh the list
      await fetchContacts();
      
      return newContact;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create contact',
      }));
      return null;
    }
  }, [getAuthHeaders, fetchContacts]);

  const updateContact = useCallback(async (id: string, data: UpdateContactDTO): Promise<Contact | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/contacts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update contact');
      }
      
      const result = await response.json();
      const updatedContact = result.data as Contact;
      
      // Update the local state
      setState(prev => ({
        ...prev,
        contacts: prev.contacts.map(c => c.id === id ? updatedContact : c),
      }));
      
      return updatedContact;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update contact',
      }));
      return null;
    }
  }, [getAuthHeaders]);

  const deleteContact = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/contacts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return false;
      }
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        contacts: prev.contacts.filter(c => c.id !== id),
        pagination: prev.pagination 
          ? { ...prev.pagination, total: prev.pagination.total - 1 }
          : null,
      }));
      
      return true;
    } catch (error) {
      return false;
    }
  }, [getAuthHeaders]);

  const getActivities = useCallback(async (contactId: string): Promise<ContactActivity[]> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/contacts/${contactId}/activities`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return [];
      }
      
      const result = await response.json();
      return result.data as ContactActivity[];
    } catch (error) {
      return [];
    }
  }, [getAuthHeaders]);

  const addActivity = useCallback(async (
    contactId: string,
    data: Partial<ContactActivity>
  ): Promise<ContactActivity | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/contacts/${contactId}/activities`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        return null;
      }
      
      const result = await response.json();
      return result.data as ContactActivity;
    } catch (error) {
      return null;
    }
  }, [getAuthHeaders]);

  const setPage = useCallback((page: number) => {
    const newPagination = { ...paginationParams, page };
    setPaginationParams(newPagination);
    fetchContacts(filters, newPagination);
  }, [paginationParams, filters, fetchContacts]);

  const handleSetFilters = useCallback((newFilters: ContactFilters) => {
    setFilters(newFilters);
    fetchContacts(newFilters, { ...paginationParams, page: 1 });
  }, [paginationParams, fetchContacts]);

  const refresh = useCallback(async () => {
    await fetchContacts();
  }, [fetchContacts]);

  return {
    ...state,
    fetchContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    getActivities,
    addActivity,
    setFilters: handleSetFilters,
    setPage,
    refresh,
  };
}
