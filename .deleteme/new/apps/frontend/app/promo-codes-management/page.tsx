'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import {
  Tag,
  Search,
  X,
  Trash2,
  Plus,
  Edit2,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { logActivity } from '@/lib/activity';
import { getApiUrl } from '@/lib/api';
import { siteConfig } from '@/data/config';
import {
  PromoCode,
  PromoCodeStatus,
  PromoCodeDiscountType,
  PROMO_CODE_STATUS_COLORS,
  formatDiscount,
  getPromoCodeExpiryText,
  isPromoCodeValid
} from '@/types/promo-codes';

interface DeleteModalProps {
  promoCode: PromoCode;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ promoCode, onConfirm, onCancel }: DeleteModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmEnabled = confirmText === 'delete';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isConfirmEnabled) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Delete Promo Code</h3>
        <p className="text-gray-500 dark:text-zinc-400 mb-6 text-center text-sm">
          Are you sure you want to delete <span className="text-gray-900 dark:text-white font-medium">{promoCode.code}</span>?
          This action cannot be undone.
        </p>
        <div className="mb-4">
          <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-2">Type <span className="text-gray-900 dark:text-white font-medium">delete</span> to confirm</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="delete"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmEnabled}
            className={cn(
              "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              isConfirmEnabled
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
            )}
          >
            Delete Promo Code
          </button>
        </div>
      </div>
    </div>
  );
}

interface PromoCodeFormModalProps {
  promoCode?: PromoCode | null;
  onClose: () => void;
  onSave: (data: Partial<PromoCode>) => Promise<void>;
}

function PromoCodeFormModal({ promoCode, onClose, onSave }: PromoCodeFormModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: promoCode?.code || '',
    name: promoCode?.name || '',
    description: promoCode?.description || '',
    discountType: promoCode?.discountType || 'percentage' as PromoCodeDiscountType,
    discountValue: promoCode ? (promoCode.discountType === 'fixed_amount' ? promoCode.discountValue / 100 : promoCode.discountValue) : 10,
    maxUses: promoCode?.maxUses ?? '',
    maxUsesPerCustomer: promoCode?.maxUsesPerCustomer || 1,
    minimumOrderAmount: promoCode?.minimumOrderAmount ? promoCode.minimumOrderAmount / 100 : '',
    startDate: promoCode?.startDate ? new Date(promoCode.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: promoCode?.endDate ? new Date(promoCode.endDate).toISOString().split('T')[0] : '',
    status: promoCode?.status || 'active' as PromoCodeStatus,
    isPublic: promoCode?.isPublic || false,
    terms: promoCode?.terms || '',
  });

  const handleSubmit = async () => {
    if (!formData.code || !formData.name || !formData.discountValue || !formData.startDate) {
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        maxUses: formData.maxUses === '' ? null : Number(formData.maxUses),
        minimumOrderAmount: formData.minimumOrderAmount === '' ? null : Number(formData.minimumOrderAmount),
        endDate: formData.endDate || null,
      } as any);
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {promoCode ? 'Edit Promo Code' : 'Create Promo Code'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Code and Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Promo Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                placeholder="SUMMER20"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Summer Sale 2024"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter a description for this promo code..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Discount Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Discount Type *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value as PromoCodeDiscountType }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="percentage">Percentage Off</option>
                <option value="fixed_amount">Fixed Amount Off</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                Discount Value * {formData.discountType === 'percentage' ? '(%)' : '($)'}
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {formData.discountType === 'percentage' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                </div>
                <input
                  type="number"
                  min="0"
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                  step={formData.discountType === 'percentage' ? 1 : 0.01}
                  value={formData.discountValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                  placeholder={formData.discountType === 'percentage' ? '20' : '50.00'}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Max Total Uses (blank = unlimited)</label>
              <input
                type="number"
                min="0"
                value={formData.maxUses}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value === '' ? '' : Number(e.target.value) }))}
                placeholder="Unlimited"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Max Uses Per Customer</label>
              <input
                type="number"
                min="1"
                value={formData.maxUsesPerCustomer}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUsesPerCustomer: Number(e.target.value) }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Minimum Order Amount and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Minimum Order Amount ($)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumOrderAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimumOrderAmount: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="No minimum"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as PromoCodeStatus }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Terms & Conditions</label>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              placeholder="Enter any terms and conditions..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Public Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                formData.isPublic ? "bg-blue-500" : "bg-gray-200 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  formData.isPublic ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-500" />
              Show on Public Promo Codes Page
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl border border-gray-200 dark:border-zinc-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.code || !formData.name || !formData.discountValue || !formData.startDate || isSaving}
            className={cn(
              "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
              formData.code && formData.name && formData.discountValue && formData.startDate && !isSaving
                ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white hover:from-sky-500 hover:to-blue-500"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {promoCode ? 'Save Changes' : 'Create Promo Code'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromoCodesManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [promoCodeToDelete, setPromoCodeToDelete] = useState<PromoCode | null>(null);
  const [promoCodeToEdit, setPromoCodeToEdit] = useState<PromoCode | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [publicFilter, setPublicFilter] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const apiUrl = getApiUrl();

      // Fetch user profile to check admin status
      fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const hasSiteAdminRole = data.roles?.includes('Site Admin');
          const hasAdminRole = data.roles?.includes('Admin');
          setIsSiteAdmin(hasSiteAdminRole);
          setIsAdmin(hasAdminRole);

          if (!hasSiteAdminRole && !hasAdminRole) {
            router.push('/404');
            return;
          }

          // Fetch promo codes for this site's company
          const companyId = siteConfig.companyId;
          const url = companyId
            ? `${apiUrl}/api/v1/promo-codes?companyId=${companyId}`
            : `${apiUrl}/api/v1/promo-codes`;
          return fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        })
        .then(response => {
          if (response) {
            return response.json();
          }
        })
        .then(result => {
          if (result) {
            const codesData = result?.data || result || [];
            setPromoCodes(Array.isArray(codesData) ? codesData : []);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          toast({
            title: "Error",
            description: "Failed to load promo codes. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
        });
    }
  }, [toast, router]);

  const handleCreate = async (data: Partial<PromoCode>) => {
    const token = localStorage.getItem('token');
    const apiUrl = getApiUrl();

    // Include companyId from site config to ensure promo is created for this site's company
    const payload = {
      ...data,
      companyId: siteConfig.companyId
    };

    const response = await fetch(`${apiUrl}/api/v1/promo-codes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create promo code';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.error || errorData.message || errorMessage;
      } catch {
        // Ignore JSON parse errors
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw new Error(errorMessage);
    }

    const result = await response.json();
    const codeData = result.data || result;
    setPromoCodes(prev => [codeData, ...prev]);

    await logActivity({
      type: 'promo_code',
      action: 'created',
      title: `Promo code "${data.code}"`,
      entityId: codeData.id
    });

    toast({
      title: "Success",
      description: "Promo code created successfully",
    });
  };

  const handleEdit = async (data: Partial<PromoCode>) => {
    if (!promoCodeToEdit) return;

    const token = localStorage.getItem('token');
    const apiUrl = getApiUrl();

    const response = await fetch(`${apiUrl}/api/v1/promo-codes/${promoCodeToEdit.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update promo code';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.error || errorData.message || errorMessage;
      } catch {
        // Ignore JSON parse errors
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw new Error(errorMessage);
    }

    const result = await response.json();
    const codeData = result.data || result;
    setPromoCodes(prev => prev.map(c => c.id === promoCodeToEdit.id ? codeData : c));

    await logActivity({
      type: 'promo_code',
      action: 'updated',
      title: `Promo code "${data.code}"`,
      entityId: promoCodeToEdit.id
    });

    toast({
      title: "Success",
      description: "Promo code updated successfully",
    });

    setPromoCodeToEdit(null);
  };

  const handleDelete = async (promoCode: PromoCode) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/v1/promo-codes/${promoCode.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      if (!response.ok) throw new Error('Failed to delete promo code');

      await logActivity({
        type: 'promo_code',
        action: 'deleted',
        title: `Promo code "${promoCode.code}"`,
        entityId: promoCode.id
      });

      setPromoCodes(promoCodes.filter(c => c.id !== promoCode.id));
      toast({
        title: "Success",
        description: "Promo code deleted successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete promo code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPromoCodeToDelete(null);
    }
  };

  const togglePublic = async (promoCode: PromoCode) => {
    const token = localStorage.getItem('token');
    const apiUrl = getApiUrl();

    try {
      const response = await fetch(`${apiUrl}/api/v1/promo-codes/${promoCode.id}/visibility`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublic: !promoCode.isPublic })
      });

      if (!response.ok) throw new Error('Failed to toggle visibility');

      const result = await response.json();
      const codeData = result.data || result;
      setPromoCodes(prev => prev.map(c => c.id === promoCode.id ? codeData : c));

      toast({
        title: "Success",
        description: promoCode.isPublic ? "Promo code hidden from public page" : "Promo code shown on public page",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive"
      });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setPublicFilter(null);
  };

  // Filter promo codes
  const filteredPromoCodes = useMemo(() => {
    return promoCodes.filter(promoCode => {
      // Status filter
      if (statusFilter && promoCode.status !== statusFilter) return false;

      // Public filter
      if (publicFilter !== null && promoCode.isPublic !== publicFilter) return false;

      // Search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          promoCode.code.toLowerCase().includes(searchLower) ||
          promoCode.name.toLowerCase().includes(searchLower) ||
          (promoCode.description?.toLowerCase() || '').includes(searchLower)
        );
      }

      return true;
    });
  }, [promoCodes, searchQuery, statusFilter, publicFilter]);

  const activeFilterCount = [statusFilter, publicFilter !== null ? publicFilter : null].filter(v => v !== null).length;

  if (!isSiteAdmin && !isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isSiteAdmin || isAdmin} noPadding>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isSiteAdmin || isAdmin} noPadding>
      <SubHeader
        icon={Tag}
        title={`Promo Codes (${filteredPromoCodes.length})`}
        subtitle="Create and manage promotional codes for customer discounts"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg font-medium hover:from-sky-500 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Create Promo Code
          </button>
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search promo codes..."
              className="w-full pl-11 pr-10 py-3 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
              showFilters
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                : "bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-700"
            )}
          >
            Filters {activeFilterCount > 0 && <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-md">{activeFilterCount}</span>}
          </button>

          {/* Clear Filters */}
          {(searchQuery || activeFilterCount > 0) && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 mb-6 space-y-4">
            {/* Status Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filter by Status</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatusFilter(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    statusFilter === null
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  All
                </button>
                {(['active', 'inactive', 'expired'] as PromoCodeStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize",
                      statusFilter === status
                        ? `${PROMO_CODE_STATUS_COLORS[status].bg} ${PROMO_CODE_STATUS_COLORS[status].text} border ${PROMO_CODE_STATUS_COLORS[status].border}`
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Public Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Visibility</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setPublicFilter(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    publicFilter === null
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setPublicFilter(true)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                    publicFilter === true
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Eye className="w-3 h-3" />
                  Public
                </button>
                <button
                  onClick={() => setPublicFilter(false)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                    publicFilter === false
                      ? "bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <EyeOff className="w-3 h-3" />
                  Private
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Promo Codes List */}
        {filteredPromoCodes.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800">
            <Tag className="w-12 h-12 text-gray-400 dark:text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No promo codes found</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm">
              {promoCodes.length === 0
                ? "Get started by creating your first promo code."
                : "Try adjusting your search or filters."}
            </p>
            {promoCodes.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium hover:from-sky-500 hover:to-blue-500 transition-all text-sm"
              >
                Create Promo Code
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPromoCodes.map((promoCode) => {
              const statusColors = PROMO_CODE_STATUS_COLORS[promoCode.status];
              const expiryText = getPromoCodeExpiryText(promoCode);
              const isValid = isPromoCodeValid(promoCode);

              return (
                <div
                  key={promoCode.id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-3">
                        {/* Code with copy button */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                            {promoCode.code}
                          </span>
                          <button
                            onClick={() => copyCode(promoCode.code)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === promoCode.code ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Status Badge */}
                        <span className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-md border capitalize",
                          statusColors.bg, statusColors.text, statusColors.border
                        )}>
                          {statusColors.label}
                        </span>

                        {promoCode.isPublic && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Public
                          </span>
                        )}
                      </div>

                      {/* Name and Description */}
                      <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">{promoCode.name}</h3>
                      {promoCode.description && (
                        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-3 line-clamp-1">{promoCode.description}</p>
                      )}

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-zinc-400">
                        {/* Discount */}
                        <span className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                          {promoCode.discountType === 'percentage' ? (
                            <Percent className="w-3.5 h-3.5" />
                          ) : (
                            <DollarSign className="w-3.5 h-3.5" />
                          )}
                          {formatDiscount(promoCode.discountType, promoCode.discountValue)}
                        </span>

                        {/* Date Range */}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(promoCode.startDate).toLocaleDateString()}
                          {promoCode.endDate && ` - ${new Date(promoCode.endDate).toLocaleDateString()}`}
                        </span>

                        {/* Usage */}
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {promoCode.usedCount} / {promoCode.maxUses ?? '∞'} uses
                        </span>

                        {/* Expiry */}
                        {expiryText && (
                          <span className={cn(
                            "px-2 py-0.5 text-xs rounded-md",
                            expiryText === 'Expired' ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                            expiryText.includes('today') || expiryText.includes('tomorrow') ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                            "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                          )}>
                            {expiryText}
                          </span>
                        )}

                        {/* Minimum */}
                        {promoCode.minimumOrderAmount && (
                          <span className="text-xs text-gray-400 dark:text-zinc-500">
                            Min: ${(promoCode.minimumOrderAmount / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => togglePublic(promoCode)}
                        className={cn(
                          "p-2 rounded-lg transition-all",
                          promoCode.isPublic
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "text-gray-400 dark:text-zinc-500 hover:text-blue-600 hover:bg-blue-500/10"
                        )}
                        title={promoCode.isPublic ? "Hide from public page" : "Show on public page"}
                      >
                        {promoCode.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setPromoCodeToEdit(promoCode)}
                        className="p-2 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPromoCodeToDelete(promoCode)}
                        className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <PromoCodeFormModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
        />
      )}

      {promoCodeToEdit && (
        <PromoCodeFormModal
          promoCode={promoCodeToEdit}
          onClose={() => setPromoCodeToEdit(null)}
          onSave={handleEdit}
        />
      )}

      {promoCodeToDelete && (
        <DeleteModal
          promoCode={promoCodeToDelete}
          onConfirm={() => handleDelete(promoCodeToDelete)}
          onCancel={() => setPromoCodeToDelete(null)}
        />
      )}
    </Layout>
  );
}
