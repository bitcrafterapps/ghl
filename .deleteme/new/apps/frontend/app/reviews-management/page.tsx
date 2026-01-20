'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import {
  Star,
  Search,
  X,
  Trash2,
  Plus,
  Edit2,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { logActivity } from '@/lib/activity';
import { getApiUrl, getSiteId } from '@/lib/api';

interface Review {
  id: number;
  reviewerName: string;
  reviewerLocation?: string;
  reviewerEmail?: string;
  text: string;
  rating: number;
  service?: string;
  source: 'manual' | 'google' | 'yelp' | 'facebook' | 'other';
  featured: boolean;
  sortOrder?: number;
  status: 'draft' | 'published' | 'archived';
  reviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface DeleteModalProps {
  review: Review;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ review, onConfirm, onCancel }: DeleteModalProps) {
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
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Delete Review</h3>
        <p className="text-gray-500 dark:text-zinc-400 mb-6 text-center text-sm">
          Are you sure you want to delete the review from <span className="text-gray-900 dark:text-white font-medium">{review.reviewerName}</span>?
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
            Delete Review
          </button>
        </div>
      </div>
    </div>
  );
}

interface ReviewFormModalProps {
  review?: Review | null;
  onClose: () => void;
  onSave: (data: Partial<Review>) => Promise<void>;
  services: string[];
}

function ReviewFormModal({ review, onClose, onSave, services }: ReviewFormModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    reviewerName: review?.reviewerName || '',
    reviewerLocation: review?.reviewerLocation || '',
    reviewerEmail: review?.reviewerEmail || '',
    text: review?.text || '',
    rating: review?.rating || 5,
    service: review?.service || '',
    source: review?.source || 'manual' as const,
    featured: review?.featured || false,
    status: review?.status || 'published' as const,
    reviewDate: review?.reviewDate ? new Date(review.reviewDate).toISOString().split('T')[0] : ''
  });

  const handleSubmit = async () => {
    if (!formData.reviewerName || !formData.text || !formData.rating) {
      return;
    }
    setIsSaving(true);
    try {
      await onSave(formData);
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
            {review ? 'Edit Review' : 'Add New Review'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Rating *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className="p-1"
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      star <= formData.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300 dark:text-zinc-600"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Reviewer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Reviewer Name *</label>
              <input
                type="text"
                value={formData.reviewerName}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewerName: e.target.value }))}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Location</label>
              <input
                type="text"
                value={formData.reviewerLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewerLocation: e.target.value }))}
                placeholder="City, State"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Review Text *</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Enter the review text..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          {/* Service and Source */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Service</label>
              <input
                type="text"
                value={formData.service}
                onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
                placeholder="e.g., Plumbing Repair"
                list="services"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <datalist id="services">
                {services.map((svc) => (
                  <option key={svc} value={svc} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value as Review['source'] }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="manual">Manual Entry</option>
                <option value="google">Google</option>
                <option value="yelp">Yelp</option>
                <option value="facebook">Facebook</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Status and Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Review['status'] }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Review Date</label>
              <input
                type="date"
                value={formData.reviewDate}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewDate: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                formData.featured ? "bg-yellow-500" : "bg-gray-200 dark:bg-zinc-700"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  formData.featured ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Featured Review
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
            disabled={!formData.reviewerName || !formData.text || isSaving}
            className={cn(
              "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
              formData.reviewerName && formData.text && !isSaving
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
                {review ? 'Save Changes' : 'Create Review'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [featuredFilter, setFeaturedFilter] = useState<boolean | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const apiUrl = getApiUrl();
      const siteId = getSiteId();

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

          // Fetch reviews and services in parallel with site scoping
          return Promise.all([
            fetch(`${apiUrl}/api/v1/reviews`, {
              headers: { 
                'Authorization': `Bearer ${token}`,
                ...(siteId ? { 'x-site-id': siteId } : {})
              }
            }),
            fetch(`${apiUrl}/api/v1/reviews/services`, {
              headers: siteId ? { 'x-site-id': siteId } : {}
            })
          ]);
        })
        .then(responses => {
          if (responses) {
            return Promise.all(responses.map(r => r.json()));
          }
        })
        .then(results => {
          if (results) {
            // API returns data directly, or wrapped in 'data' for arrays
            const reviewsData = results[0]?.data || results[0] || [];
            const servicesData = results[1]?.data || results[1] || [];
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            setServices(Array.isArray(servicesData) ? servicesData : []);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          toast({
            title: "Error",
            description: "Failed to load reviews. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
        });
    }
  }, [toast, router]);

  const handleCreate = async (data: Partial<Review>) => {
    const token = localStorage.getItem('token');
    const apiUrl = getApiUrl();
    const siteId = getSiteId();

    const response = await fetch(`${apiUrl}/api/v1/reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(siteId ? { 'x-site-id': siteId } : {})
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage = 'Failed to create review';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
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
    // API returns data directly, not wrapped in a 'data' property
    const reviewData = result.data || result;
    setReviews(prev => [reviewData, ...prev]);

    // Update services if new one was added
    if (data.service && !services.includes(data.service)) {
      setServices(prev => [...prev, data.service!]);
    }

    await logActivity({
      type: 'review',
      action: 'created',
      title: `Review from "${data.reviewerName}"`,
      entityId: reviewData.id
    });

    toast({
      title: "Success",
      description: "Review created successfully",
    });
  };

  const handleEdit = async (data: Partial<Review>) => {
    if (!reviewToEdit) return;

    const token = localStorage.getItem('token');
    const apiUrl = getApiUrl();
    const siteId = getSiteId();

    const response = await fetch(`${apiUrl}/api/v1/reviews/${reviewToEdit.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(siteId ? { 'x-site-id': siteId } : {})
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      // Try to parse error message from response
      let errorMessage = 'Failed to update review';
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
    // API returns data directly, not wrapped in a 'data' property
    const reviewData = result.data || result;
    setReviews(prev => prev.map(r => r.id === reviewToEdit.id ? reviewData : r));

    // Update services if new one was added
    if (data.service && !services.includes(data.service)) {
      setServices(prev => [...prev, data.service!]);
    }

    await logActivity({
      type: 'review',
      action: 'updated',
      title: `Review from "${data.reviewerName}"`,
      entityId: reviewToEdit.id
    });

    toast({
      title: "Success",
      description: "Review updated successfully",
    });

    setReviewToEdit(null);
  };

  const handleDelete = async (review: Review) => {
    try {
      const apiUrl = getApiUrl();
      const siteId = getSiteId();
      const response = await fetch(`${apiUrl}/api/v1/reviews/${review.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          ...(siteId ? { 'x-site-id': siteId } : {})
        }
      });

      if (!response.ok) throw new Error('Failed to delete review');

      await logActivity({
        type: 'review',
        action: 'deleted',
        title: `Review from "${review.reviewerName}"`,
        entityId: review.id
      });

      setReviews(reviews.filter(r => r.id !== review.id));
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setReviewToDelete(null);
    }
  };

  const toggleFeatured = async (review: Review) => {
    const token = localStorage.getItem('token');
    const apiUrl = getApiUrl();
    const siteId = getSiteId();

    try {
      const response = await fetch(`${apiUrl}/api/v1/reviews/${review.id}/featured`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(siteId ? { 'x-site-id': siteId } : {})
        },
        body: JSON.stringify({ featured: !review.featured })
      });

      if (!response.ok) throw new Error('Failed to toggle featured');

      const result = await response.json();
      // API returns data directly, not wrapped in a 'data' property
      const reviewData = result.data || result;
      setReviews(prev => prev.map(r => r.id === review.id ? reviewData : r));

      toast({
        title: "Success",
        description: review.featured ? "Review unfeatured" : "Review featured",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive"
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter(null);
    setFeaturedFilter(null);
  };

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      // Status filter
      if (statusFilter && review.status !== statusFilter) return false;

      // Featured filter
      if (featuredFilter !== null && review.featured !== featuredFilter) return false;

      // Search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          review.reviewerName.toLowerCase().includes(searchLower) ||
          (review.reviewerLocation?.toLowerCase() || '').includes(searchLower) ||
          review.text.toLowerCase().includes(searchLower) ||
          (review.service?.toLowerCase() || '').includes(searchLower)
        );
      }

      return true;
    });
  }, [reviews, searchQuery, statusFilter, featuredFilter]);

  const activeFilterCount = [statusFilter, featuredFilter !== null ? featuredFilter : null].filter(v => v !== null).length;

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
        icon={Star}
        title={`Reviews (${filteredReviews.length})`}
        subtitle="Manage customer reviews and testimonials"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg font-medium hover:from-sky-500 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Review
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
              placeholder="Search reviews..."
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
                <button
                  onClick={() => setStatusFilter('published')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                    statusFilter === 'published'
                      ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Eye className="w-3 h-3" />
                  Published
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                    statusFilter === 'draft'
                      ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <EyeOff className="w-3 h-3" />
                  Draft
                </button>
                <button
                  onClick={() => setStatusFilter('archived')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    statusFilter === 'archived'
                      ? "bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  Archived
                </button>
              </div>
            </div>

            {/* Featured Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Featured Status</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFeaturedFilter(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    featuredFilter === null
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setFeaturedFilter(true)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                    featuredFilter === true
                      ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Sparkles className="w-3 h-3" />
                  Featured
                </button>
                <button
                  onClick={() => setFeaturedFilter(false)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    featuredFilter === false
                      ? "bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  Not Featured
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800">
            <Star className="w-12 h-12 text-gray-400 dark:text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews found</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm">
              {reviews.length === 0
                ? "Get started by adding your first customer review."
                : "Try adjusting your search or filters."}
            </p>
            {reviews.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-6 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium hover:from-sky-500 hover:to-blue-500 transition-all text-sm"
              >
                Add Review
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 dark:text-zinc-600"
                            )}
                          />
                        ))}
                      </div>

                      {/* Status Badge */}
                      {review.status === 'published' ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                          Published
                        </span>
                      ) : review.status === 'draft' ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                          Draft
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20">
                          Archived
                        </span>
                      )}

                      {review.featured && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-700 dark:text-zinc-300 mb-3 line-clamp-2">
                      "{review.text}"
                    </p>

                    {/* Reviewer Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {review.reviewerName}
                      </span>
                      {review.reviewerLocation && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {review.reviewerLocation}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(review.reviewDate || review.createdAt).toLocaleDateString()}
                      </span>
                      {review.service && (
                        <span className="px-2 py-0.5 text-xs rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {review.service}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFeatured(review)}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        review.featured
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                          : "text-gray-400 dark:text-zinc-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                      )}
                      title={review.featured ? "Remove from featured" : "Add to featured"}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setReviewToEdit(review)}
                      className="p-2 text-gray-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setReviewToDelete(review)}
                      className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <ReviewFormModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
          services={services}
        />
      )}

      {reviewToEdit && (
        <ReviewFormModal
          review={reviewToEdit}
          onClose={() => setReviewToEdit(null)}
          onSave={handleEdit}
          services={services}
        />
      )}

      {reviewToDelete && (
        <DeleteModal
          review={reviewToDelete}
          onConfirm={() => handleDelete(reviewToDelete)}
          onCancel={() => setReviewToDelete(null)}
        />
      )}
    </Layout>
  );
}
