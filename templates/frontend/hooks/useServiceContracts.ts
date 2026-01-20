'use client';

import { useState, useCallback } from 'react';
import type {
  ServiceContract,
  CreateServiceContractDTO,
  UpdateServiceContractDTO,
  ContractFilters,
  ContractStatus,
} from '@/types/service-contracts';
import type { PaginationParams, PaginatedResponse } from '@/types/contacts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface UseServiceContractsState {
  contracts: ServiceContract[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

interface UseServiceContractsActions {
  fetchContracts: (filters?: ContractFilters, pagination?: PaginationParams) => Promise<void>;
  getContract: (id: string) => Promise<ServiceContract | null>;
  createContract: (data: CreateServiceContractDTO) => Promise<ServiceContract | null>;
  updateContract: (id: string, data: UpdateServiceContractDTO) => Promise<ServiceContract | null>;
  updateContractStatus: (id: string, status: ContractStatus) => Promise<ServiceContract | null>;
  deleteContract: (id: string) => Promise<boolean>;
  renewContract: (id: string, newEndDate: string) => Promise<ServiceContract | null>;
  setFilters: (filters: ContractFilters) => void;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export function useServiceContracts(): UseServiceContractsState & UseServiceContractsActions {
  const [state, setState] = useState<UseServiceContractsState>({
    contracts: [],
    loading: false,
    error: null,
    pagination: null,
  });
  
  const [filters, setFiltersState] = useState<ContractFilters>({});
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc'
  });

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const buildQueryString = useCallback((filters: ContractFilters, pagination: PaginationParams): string => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      statuses.forEach(s => params.append('status', s));
    }
    if (filters.contactId) params.append('contactId', filters.contactId);
    if (filters.serviceType) params.append('serviceType', filters.serviceType);
    if (filters.expiringWithinDays) params.append('expiringWithinDays', String(filters.expiringWithinDays));
    
    if (pagination.page) params.append('page', String(pagination.page));
    if (pagination.limit) params.append('limit', String(pagination.limit));
    if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
    if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
    
    return params.toString();
  }, []);

  const fetchContracts = useCallback(async (
    newFilters?: ContractFilters,
    newPagination?: PaginationParams
  ): Promise<void> => {
    const currentFilters = newFilters || filters;
    const currentPagination = newPagination || paginationParams;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const queryString = buildQueryString(currentFilters, currentPagination);
      const response = await fetch(`${API_BASE}/api/v1/service-contracts?${queryString}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }
      
      const result = await response.json();
      const data = result.data as PaginatedResponse<ServiceContract>;
      
      setState(prev => ({
        ...prev,
        contracts: data.data,
        pagination: data.pagination,
        loading: false,
      }));
      
      if (newFilters) setFiltersState(newFilters);
      if (newPagination) setPaginationParams(newPagination);
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [filters, paginationParams, buildQueryString, getAuthHeaders]);

  const getContract = useCallback(async (id: string): Promise<ServiceContract | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/service-contracts/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) return null;
      
      const result = await response.json();
      return result.data as ServiceContract;
    } catch (error) {
      return null;
    }
  }, [getAuthHeaders]);

  const createContract = useCallback(async (data: CreateServiceContractDTO): Promise<ServiceContract | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/service-contracts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create contract');
      }
      
      const result = await response.json();
      const newContract = result.data as ServiceContract;
      
      await fetchContracts();
      
      return newContract;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create contract',
      }));
      return null;
    }
  }, [getAuthHeaders, fetchContracts]);

  const updateContract = useCallback(async (id: string, data: UpdateServiceContractDTO): Promise<ServiceContract | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/service-contracts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update contract');
      }
      
      const result = await response.json();
      const updatedContract = result.data as ServiceContract;
      
      setState(prev => ({
        ...prev,
        contracts: prev.contracts.map(c => c.id === id ? updatedContract : c),
      }));
      
      return updatedContract;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update contract',
      }));
      return null;
    }
  }, [getAuthHeaders]);

  const updateContractStatus = useCallback(async (id: string, status: ContractStatus): Promise<ServiceContract | null> => {
    return updateContract(id, { status });
  }, [updateContract]);

  const deleteContract = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/service-contracts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) return false;
      
      setState(prev => ({
        ...prev,
        contracts: prev.contracts.filter(c => c.id !== id),
      }));
      
      return true;
    } catch (error) {
      return false;
    }
  }, [getAuthHeaders]);

  const renewContract = useCallback(async (id: string, newEndDate: string): Promise<ServiceContract | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/service-contracts/${id}/renew`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newEndDate }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to renew contract');
      }
      
      const result = await response.json();
      const renewedContract = result.data as ServiceContract;
      
      setState(prev => ({
        ...prev,
        contracts: prev.contracts.map(c => c.id === id ? renewedContract : c),
      }));
      
      return renewedContract;
    } catch (error) {
      return null;
    }
  }, [getAuthHeaders]);

  const setFilters = useCallback((newFilters: ContractFilters) => {
    setFiltersState(newFilters);
    fetchContracts(newFilters, { ...paginationParams, page: 1 });
  }, [paginationParams, fetchContracts]);

  const setPage = useCallback((page: number) => {
    const newPagination = { ...paginationParams, page };
    setPaginationParams(newPagination);
    fetchContracts(filters, newPagination);
  }, [paginationParams, filters, fetchContracts]);

  const refresh = useCallback(async () => {
    await fetchContracts();
  }, [fetchContracts]);

  return {
    ...state,
    fetchContracts,
    getContract,
    createContract,
    updateContract,
    updateContractStatus,
    deleteContract,
    renewContract,
    setFilters,
    setPage,
    refresh,
  };
}
