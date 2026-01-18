'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useServiceContracts } from '@/hooks/useServiceContracts';
import { ContractForm } from '@/components/service-contracts/ContractForm';
import type { ServiceContract, CreateServiceContractDTO } from '@/types/service-contracts';
import { CONTRACT_STATUS_COLORS, BILLING_FREQUENCY_LABELS, SERVICE_FREQUENCY_LABELS } from '@/types/service-contracts';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  FileText,
  User,
  Bell,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ContractDetailPage({ params }: ContractDetailPageProps) {
  // Unwrap params safely
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  // Debug logging
  useEffect(() => {
    console.log('ContractDetailPage mounted with ID:', id);
  }, [id]);

  const router = useRouter();
  const { getContract, updateContract, deleteContract, renewContract } = useServiceContracts();
  
  const [contract, setContract] = useState<ServiceContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [renewConfirm, setRenewConfirm] = useState(false);
  const [renewEndDate, setRenewEndDate] = useState('');
  
  useEffect(() => {
    loadContract();
  }, [id]);
  
  const loadContract = async () => {
    if (!id) return;
    console.log('Loading contract details for:', id);
    
    setLoading(true);
    try {
      const data = await getContract(id);
      console.log('Contract data received:', data ? 'Found' : 'Null');
      setContract(data);
    } catch (err) {
      console.error('Error loading contract:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdate = async (data: CreateServiceContractDTO) => {
    setFormLoading(true);
    try {
      const updated = await updateContract(id, data);
      if (updated) {
        setContract(updated);
        setShowEditForm(false);
      }
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDelete = async () => {
    const success = await deleteContract(id);
    if (success) {
      router.push('/service-contracts');
    }
  };
  
  const handleRenew = async () => {
    if (!renewEndDate) return;
    const renewed = await renewContract(id, renewEndDate);
    if (renewed) {
      setContract(renewed);
    }
    setRenewConfirm(false);
    setRenewEndDate('');
  };
  
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }
  
  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contract Not Found</h2>
        <p className="text-gray-500 mb-6">The contract you're looking for doesn't exist or has been deleted.</p>
        <Link
          href="/service-contracts"
          className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contracts
        </Link>
      </div>
    );
  }
  
  const statusColors = CONTRACT_STATUS_COLORS[contract.status];
  const contactName = contract.contact
    ? [contract.contact.firstName, contract.contact.lastName].filter(Boolean).join(' ')
    : null;
  
  const isExpiringSoon = contract.endDate &&
    new Date(contract.endDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 &&
    new Date(contract.endDate).getTime() > Date.now();
  
  const isExpired = contract.endDate && new Date(contract.endDate).getTime() < Date.now();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/service-contracts"
                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{contract.title}</h1>
                  <span className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-full border',
                    statusColors.bg,
                    statusColors.text,
                    statusColors.border
                  )}>
                    {statusColors.label}
                  </span>
                  {isExpiringSoon && contract.status === 'active' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      Expiring Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{contract.contractNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {contract.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    setRenewConfirm(true);
                    const currentEnd = contract.endDate ? new Date(contract.endDate) : new Date();
                    currentEnd.setFullYear(currentEnd.getFullYear() + 1);
                    setRenewEndDate(currentEnd.toISOString().split('T')[0]);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Renew
                </button>
              )}
              <button
                onClick={() => setShowEditForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contract Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contract Details Card */}
            <div className="bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/5 p-6 space-y-5">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contract Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-teal-500/10 rounded-lg">
                    <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Service Type</p>
                    <p className="text-sm text-gray-900 dark:text-white">{contract.serviceType}</p>
                  </div>
                </div>
                
                {contactName && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Client</p>
                      <p className="text-sm text-gray-900 dark:text-white">{contactName}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(contract.amount)} / {BILLING_FREQUENCY_LABELS[contract.billingFrequency].toLowerCase()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Service Frequency</p>
                    <p className="text-sm text-gray-900 dark:text-white">{SERVICE_FREQUENCY_LABELS[contract.serviceFrequency]}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Schedule Card */}
            <div className="bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/5 p-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Schedule</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Start Date</span>
                  <span className="text-gray-900 dark:text-white">{formatDate(contract.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">End Date</span>
                  <span className={cn(
                    "text-gray-900 dark:text-white",
                    isExpiringSoon && "text-orange-600 dark:text-orange-400",
                    isExpired && "text-red-600 dark:text-red-400"
                  )}>
                    {formatDate(contract.endDate)}
                    {isExpired && " (Expired)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-900 dark:text-white">{formatDate(contract.createdAt)}</span>
                </div>
              </div>
            </div>
            
            {/* Renewal Settings Card */}
            <div className="bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/5 p-6 space-y-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Renewal Settings
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Auto-Renew</span>
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full",
                    contract.autoRenew
                      ? "bg-green-500/20 text-green-600 dark:text-green-400"
                      : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                  )}>
                    {contract.autoRenew ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Enabled
                      </>
                    ) : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reminder</span>
                  <span className="text-gray-900 dark:text-white">{contract.renewalReminderDays} days before</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {contract.description && (
              <div className="bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/5 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">{contract.description}</p>
              </div>
            )}
            
            {/* Services Included */}
            {contract.servicesIncluded && contract.servicesIncluded.length > 0 && (
              <div className="bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/5 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Services Included</h3>
                <div className="flex flex-wrap gap-2">
                  {contract.servicesIncluded.map((service, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 rounded-lg"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Terms */}
            {contract.terms && (
              <div className="bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/5 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Terms & Conditions</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{contract.terms}</p>
              </div>
            )}
            
            {/* Notes */}
            {contract.notes && (
              <div className="bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/5 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Internal Notes</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{contract.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Form Modal */}
      {showEditForm && (
        <ContractForm
          contract={contract}
          onSubmit={handleUpdate}
          onCancel={() => setShowEditForm(false)}
          isLoading={formLoading}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Delete Contract</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="text-gray-900 dark:text-white font-medium">{contract.title}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
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
          <div className="w-full max-w-md p-6 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Renew Contract</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Renew <span className="text-gray-900 dark:text-white font-medium">{contract.title}</span>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New End Date</label>
              <input
                type="date"
                value={renewEndDate}
                onChange={(e) => setRenewEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setRenewConfirm(false); setRenewEndDate(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors"
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
  );
}
