'use client';

import { Layout } from '@/components/Layout';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useServiceContracts } from '@/hooks/useServiceContracts';
import { ContractCard } from '@/components/service-contracts/ContractCard';
import { ContractForm } from '@/components/service-contracts/ContractForm';
import type { ServiceContract, ContractFilters, CreateServiceContractDTO, ContractStatus } from '@/types/service-contracts';
import { CONTRACT_STATUS_COLORS } from '@/types/service-contracts';
import {
  FileText,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  X,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubHeader } from '@/components/SubHeader';

export default function ServiceContractsPage() {
  const router = useRouter();
  const {
    contracts,
    loading,
    error,
    pagination,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    renewContract,
    setFilters,
    setPage,
    refresh,
  } = useServiceContracts();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingContract, setEditingContract] = useState<ServiceContract | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ServiceContract | null>(null);
  const [renewConfirm, setRenewConfirm] = useState<ServiceContract | null>(null);
  const [renewEndDate, setRenewEndDate] = useState('');
  
  const [localFilters, setLocalFilters] = useState<ContractFilters>({});
  const [searchValue, setSearchValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);
  
  useEffect(() => {
    fetchContracts();
  }, []);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...localFilters, search: searchValue });
  };
  
  const handleStatusFilter = (status: ContractStatus) => {
    const currentStatuses = Array.isArray(localFilters.status)
      ? localFilters.status
      : localFilters.status ? [localFilters.status] : [];
    
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    const newFilters = {
      ...localFilters,
      status: newStatuses.length ? newStatuses : undefined
    };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };
  
  const handleExpiringFilter = () => {
    const newExpiringOnly = !showExpiringOnly;
    setShowExpiringOnly(newExpiringOnly);
    const newFilters = {
      ...localFilters,
      expiringWithinDays: newExpiringOnly ? 30 : undefined
    };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };
  
  const clearFilters = () => {
    setSearchValue('');
    setShowExpiringOnly(false);
    setLocalFilters({});
    setFilters({});
  };
  
  const handleCreateContract = async (data: CreateServiceContractDTO) => {
    setFormLoading(true);
    try {
      await createContract(data);
      setShowCreateForm(false);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleUpdateContract = async (data: CreateServiceContractDTO) => {
    if (!editingContract) return;
    setFormLoading(true);
    try {
      await updateContract(editingContract.id, data);
      setEditingContract(null);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteContract(deleteConfirm.id);
    setDeleteConfirm(null);
  };
  
  const handleRenew = async () => {
    if (!renewConfirm || !renewEndDate) return;
    await renewContract(renewConfirm.id, renewEndDate);
    setRenewConfirm(null);
    setRenewEndDate('');
  };
  
  const hasActiveFilters = localFilters.search || localFilters.status || showExpiringOnly;
  const activeFilterCount = [
    localFilters.status && (Array.isArray(localFilters.status) ? localFilters.status.length : 1),
    showExpiringOnly ? 1 : 0,
  ].filter(Boolean).reduce((a, b) => (a || 0) + (b || 0), 0) || 0;
  
  // Count expiring contracts
  const expiringCount = contracts.filter(c => {
    if (c.status !== 'active' || !c.endDate) return false;
    const daysUntilExpiry = (new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;
  
  return (
    <Layout isAuthenticated={true} noPadding>
      <div className="bg-[#0a0a0f] min-h-full">
      <SubHeader
        icon={FileText}
        title="Service Contracts"
        subtitle="Manage recurring service agreements"
        actions={
          <div className="flex items-center gap-3">
            {expiringCount > 0 && (
              <button
                onClick={handleExpiringFilter}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  showExpiringOnly
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20"
                )}
              >
                <AlertTriangle className="w-4 h-4" />
                {expiringCount} Expiring Soon
              </button>
            )}

            <button
              onClick={() => refresh()}
              disabled={loading}
              className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>

            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-xl shadow-lg shadow-teal-500/25 transition-all transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              New Contract
            </button>
          </div>
        }
      />
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search contracts..."
                className="w-full pl-12 pr-4 py-3 bg-[#1C1C1C] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
              />
            </form>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                showFilters || activeFilterCount > 0
                  ? "bg-teal-500/20 border-teal-500/30 text-teal-400"
                  : "bg-[#1C1C1C] border-white/10 text-gray-400 hover:text-white hover:border-white/20"
              )}
            >
              <Filter className="w-5 h-5" />
              <span className="text-sm font-medium">Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-teal-500 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          {/* Results Count */}
          {pagination && (
            <p className="text-sm text-gray-500">
              {pagination.total} {pagination.total === 1 ? 'contract' : 'contracts'} found
            </p>
          )}
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="p-5 bg-[#1C1C1C]/80 backdrop-blur-sm border border-white/10 rounded-xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CONTRACT_STATUS_COLORS).map(([status, colors]) => {
                    const isSelected = Array.isArray(localFilters.status)
                      ? localFilters.status.includes(status as ContractStatus)
                      : localFilters.status === status;
                    
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusFilter(status as ContractStatus)}
                        className={cn(
                          "px-3 py-1.5 text-sm rounded-lg border transition-all",
                          isSelected
                            ? cn(colors.bg, colors.border, colors.text)
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {colors.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}
        
        {/* Loading State */}
        {loading && contracts.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        )}
        
        {/* Empty State */}
        {!loading && contracts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-gray-500/10 rounded-full mb-4">
              <FileText className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No contracts yet</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Create service contracts to manage recurring agreements with your customers.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Contract
            </button>
          </div>
        )}
        
        {/* Contracts Grid */}
        {contracts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {contracts.map(contract => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onView={(c) => router.push(`/service-contracts/${c.id}`)}
                onEdit={setEditingContract}
                onDelete={setDeleteConfirm}
                onRenew={(c) => {
                  setRenewConfirm(c);
                  // Default to extending by 1 year
                  const currentEnd = c.endDate ? new Date(c.endDate) : new Date();
                  currentEnd.setFullYear(currentEnd.getFullYear() + 1);
                  setRenewEndDate(currentEnd.toISOString().split('T')[0]);
                }}
              />
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={cn(
                  "w-10 h-10 rounded-lg text-sm font-medium transition-colors",
                  page === pagination.page
                    ? "bg-teal-600 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingContract) && (
        <ContractForm
          contract={editingContract}
          onSubmit={editingContract ? handleUpdateContract : handleCreateContract}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingContract(null);
          }}
          isLoading={formLoading}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-[#1C1C1C] border border-white/10 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Contract</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">{deleteConfirm.title}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Renew Confirmation Modal */}
      {renewConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-[#1C1C1C] border border-white/10 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">Renew Contract</h3>
            <p className="text-gray-400 mb-4">
              Renew <span className="text-white font-medium">{renewConfirm.title}</span>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">New End Date</label>
              <input
                type="date"
                value={renewEndDate}
                onChange={(e) => setRenewEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0a0a0f] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setRenewConfirm(null); setRenewEndDate(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRenew}
                disabled={!renewEndDate}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors disabled:opacity-50"
              >
                Renew Contract
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}
