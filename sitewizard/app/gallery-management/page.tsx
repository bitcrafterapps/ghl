'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import {
  Image as ImageIcon,
  Search,
  X,
  Trash2,
  Plus,
  Upload,
  Edit2,
  ChevronRight,
  Loader2,
  Save,
  Eye,
  EyeOff,
  GripVertical,
  ArrowUpDown,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { logActivity } from '@/lib/activity';
import { getApiUrl, getSiteId } from '@/lib/api';

interface GalleryImage {
  id: number;
  title: string;
  description?: string;
  altText?: string;
  blobUrl: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
  sortOrder?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface DeleteModalProps {
  image: GalleryImage;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ image, onConfirm, onCancel }: DeleteModalProps) {
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
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Delete Image</h3>
        <p className="text-gray-500 dark:text-zinc-400 mb-6 text-center text-sm">
          Are you sure you want to delete <span className="text-gray-900 dark:text-white font-medium">{image.title || 'this image'}</span>?
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
            Delete Image
          </button>
        </div>
      </div>
    </div>
  );
}

interface UploadModalProps {
  onClose: () => void;
  onUpload: (file: File, metadata: Partial<GalleryImage>) => Promise<void>;
  categories: string[];
}

function UploadModal({ onClose, onUpload, categories }: UploadModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [metadata, setMetadata] = useState<{
    title: string;
    description: string;
    altText: string;
    category: string;
    status: 'active' | 'inactive';
  }>({
    title: '',
    description: '',
    altText: '',
    category: '',
    status: 'active'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await onUpload(file, metadata);
      onClose();
    } catch (error) {
      // Error toast is shown in handleUpload for API errors, but we need one for Network errors that bubble up
      console.warn('Upload failed:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please check your connection.",
        variant: "destructive"
      });
      // Don't close modal on error so user can try again
    }
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upload New Image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6",
            preview
              ? "border-blue-500 bg-blue-500/5"
              : "border-gray-200 dark:border-zinc-700 hover:border-blue-500 hover:bg-blue-500/5"
          )}
        >
          {preview ? (
            <div className="relative aspect-video max-h-48 mx-auto">
              <Image src={preview} alt="Preview" fill className="object-contain rounded-lg" />
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-zinc-400 mb-1">Drag and drop an image or click to browse</p>
              <p className="text-sm text-gray-400 dark:text-zinc-500">JPEG, PNG, GIF, WebP, SVG (max 10MB)</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Metadata Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Title</label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter image title"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Description</label>
            <textarea
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter image description"
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Alt Text</label>
            <input
              type="text"
              value={metadata.altText}
              onChange={(e) => setMetadata(prev => ({ ...prev, altText: e.target.value }))}
              placeholder="Describe the image for accessibility"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Category</label>
              <input
                type="text"
                value={metadata.category}
                onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Projects, Before/After"
                list="categories"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <datalist id="categories">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Status</label>
              <select
                value={metadata.status}
                onChange={(e) => setMetadata(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
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
            disabled={!file || isUploading}
            className={cn(
              "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
              file && !isUploading
                ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white hover:from-sky-500 hover:to-blue-500"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditModalProps {
  image: GalleryImage;
  onClose: () => void;
  onSave: (id: number, data: Partial<GalleryImage>) => Promise<void>;
  categories: string[];
}

function EditModal({ image, onClose, onSave, categories }: EditModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: image.title || '',
    description: image.description || '',
    altText: image.altText || '',
    category: image.category || '',
    status: image.status
  });

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(image.id, formData);
      onClose();
    } catch (error) {
      console.warn('Save failed:', error);
      toast({
        title: "Save Error",
        description: "Failed to save changes. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Image</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="relative aspect-video max-h-48 mx-auto mb-6 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800">
          <Image
            src={image.thumbnailUrl || image.blobUrl}
            alt={image.altText || image.title || 'Gallery image'}
            fill
            className="object-contain"
            unoptimized={image.blobUrl?.includes('localhost')}
          />
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter image title"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter image description"
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Alt Text</label>
            <input
              type="text"
              value={formData.altText}
              onChange={(e) => setFormData(prev => ({ ...prev, altText: e.target.value }))}
              placeholder="Describe the image for accessibility"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Projects, Before/After"
                list="edit-categories"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <datalist id="edit-categories">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
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
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white hover:from-sky-500 hover:to-blue-500 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GalleryManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
  const [imageToEdit, setImageToEdit] = useState<GalleryImage | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Reorder mode state
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  
  // User's company ID for associating uploads
  const [userCompanyId, setUserCompanyId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      const apiUrl = getApiUrl();
      const siteId = getSiteId();

      try {
        // Fetch user profile to check admin status and get company ID
        const profileResponse = await fetch(`${apiUrl}/api/v1/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!profileResponse.ok) throw new Error('Failed to fetch profile');
        
        const data = await profileResponse.json();
        const profileData = data.data || data;
        const hasSiteAdminRole = profileData.roles?.includes('Site Admin');
        const hasAdminRole = profileData.roles?.includes('Admin');
        
        setIsSiteAdmin(hasSiteAdminRole);
        setIsAdmin(hasAdminRole);
        
        // Store user's company ID for associating uploads
        if (profileData.companyId) {
          setUserCompanyId(profileData.companyId);
        }

        if (!hasSiteAdminRole && !hasAdminRole) {
          router.push('/404');
          return;
        }

        // Fetch gallery images - filter by company for Admin users, show all for Site Admin
        let galleryUrl = `${apiUrl}/api/v1/gallery-images`;
        if (hasAdminRole && !hasSiteAdminRole && profileData.companyId) {
          galleryUrl += `?companyId=${profileData.companyId}`;
        }
        
        const headers: HeadersInit = {
          'Authorization': `Bearer ${token}`
        };
        if (siteId) {
          (headers as any)['x-site-id'] = siteId;
        }

        try {
          const galleryResponse = await fetch(galleryUrl, { headers });
          if (galleryResponse.ok) {
            const result = await galleryResponse.json();
            const imagesData = result?.data || result;
            
            if (imagesData && Array.isArray(imagesData)) {
              setImages(imagesData);
              // Extract unique categories
              const uniqueCategories = Array.from(
                new Set(imagesData.map((img: GalleryImage) => img.category).filter(Boolean))
              ) as string[];
              setCategories(uniqueCategories);
            }
          }
        } catch (galleryError) {
          console.warn('Failed to fetch gallery images:', galleryError);
          // Silently fail or show mild warning
        }

      } catch (error) {
        console.warn('Error loading gallery management data:', error);
        toast({
          title: "Error",
          description: "Failed to load management data. Please refresh.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast, router]);

  const handleUpload = async (file: File, metadata: Partial<GalleryImage>) => {
    const token = localStorage.getItem('token');
    const apiUrl = getApiUrl();

    const formData = new FormData();
    formData.append('image', file);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.altText) formData.append('altText', metadata.altText);
    if (metadata.category) formData.append('category', metadata.category);
    if (metadata.status) formData.append('status', metadata.status);
    // Include user's company ID to associate the image with their company
    if (userCompanyId) formData.append('companyId', String(userCompanyId));

    const siteId = getSiteId();
    if (siteId) formData.append('siteId', siteId);
    
    // We also send in header for consistency/middleware usage
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    };
    if (siteId) {
      (headers as any)['x-site-id'] = siteId;
    }

    const response = await fetch(`${apiUrl}/api/v1/gallery-images`, {
      method: 'POST',
      headers,
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result?.error || result?.message || 'Failed to upload image';
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw new Error(errorMessage);
    }

    // API returns data directly or wrapped in data property
    const imageData = result.data || result;
    setImages(prev => [imageData, ...prev]);

    // Update categories if new one was added
    if (metadata.category && !categories.includes(metadata.category)) {
      setCategories(prev => [...prev, metadata.category!]);
    }

    await logActivity({
      type: 'gallery',
      action: 'created',
      title: `Gallery image "${metadata.title || 'Untitled'}"`,
      entityId: imageData.id
    });

    toast({
      title: "Success",
      description: "Image uploaded successfully",
    });
  };

  const handleEdit = async (id: number, data: Partial<GalleryImage>) => {
    const token = localStorage.getItem('token');
    const apiUrl = getApiUrl();

    const siteId = getSiteId();
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    if (siteId) {
      (headers as any)['x-site-id'] = siteId;
    }

    const response = await fetch(`${apiUrl}/api/v1/gallery-images/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to update image');
    }

    const result = await response.json();
    // API returns data directly or wrapped in data property
    const updatedImage = result.data || result;
    setImages(prev => prev.map(img => img.id === id ? updatedImage : img));

    // Update categories if new one was added
    if (data.category && !categories.includes(data.category)) {
      setCategories(prev => [...prev, data.category!]);
    }

    await logActivity({
      type: 'gallery',
      action: 'updated',
      title: `Gallery image "${data.title || 'Untitled'}"`,
      entityId: id
    });

    toast({
      title: "Success",
      description: "Image updated successfully",
    });
  };

  const handleDelete = async (image: GalleryImage) => {
    try {
      const apiUrl = getApiUrl();
      const siteId = getSiteId();
      const headers: HeadersInit = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };
      if (siteId) {
        (headers as any)['x-site-id'] = siteId;
      }
      
      const response = await fetch(`${apiUrl}/api/v1/gallery-images/${image.id}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) throw new Error('Failed to delete image');

      await logActivity({
        type: 'gallery',
        action: 'deleted',
        title: `Gallery image "${image.title || 'Untitled'}"`,
        entityId: image.id
      });

      setImages(images.filter(i => i.id !== image.id));
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      console.warn('Delete failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setImageToDelete(null);
    }
  };

  // Handle reorder - update local state
  const handleReorder = (newOrder: GalleryImage[]) => {
    setImages(newOrder);
    setHasOrderChanged(true);
  };

  // Save the new order to the backend
  const saveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      const siteId = getSiteId();

      // Create reorder payload with new sort orders
      const reorderData = {
        images: images.map((img, index) => ({
          id: img.id,
          sortOrder: index
        }))
      };

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      if (siteId) {
        (headers as any)['x-site-id'] = siteId;
      }

      const response = await fetch(`${apiUrl}/api/v1/gallery-images/reorder`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reorderData)
      });

      if (!response.ok) throw new Error('Failed to save order');

      // Update local state with new sort orders
      setImages(prev => prev.map((img, index) => ({ ...img, sortOrder: index })));
      setHasOrderChanged(false);

      toast({
        title: "Success",
        description: "Image order saved successfully",
      });
    } catch (error) {
      console.warn('Order save failed:', error);
      toast({
        title: "Error",
        description: "Failed to save order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Toggle image status (active/inactive)
  const handleToggleStatus = async (image: GalleryImage) => {
    const newStatus = image.status === 'active' ? 'inactive' : 'active';

    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      const siteId = getSiteId();

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      if (siteId) {
        (headers as any)['x-site-id'] = siteId;
      }

      const response = await fetch(`${apiUrl}/api/v1/gallery-images/${image.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      const result = await response.json();
      const updatedImage = result.data || result;

      setImages(prev => prev.map(img => img.id === image.id ? updatedImage : img));

      toast({
        title: "Success",
        description: `Image ${newStatus === 'active' ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.warn('Status toggle failed:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter(null);
    setStatusFilter(null);
  };

  // Filter images
  const filteredImages = useMemo(() => {
    return images.filter(image => {
      // Category filter
      if (categoryFilter && image.category !== categoryFilter) return false;

      // Status filter
      if (statusFilter && image.status !== statusFilter) return false;

      // Search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          (image.title?.toLowerCase() || '').includes(searchLower) ||
          (image.description?.toLowerCase() || '').includes(searchLower) ||
          (image.category?.toLowerCase() || '').includes(searchLower) ||
          (image.altText?.toLowerCase() || '').includes(searchLower)
        );
      }

      return true;
    });
  }, [images, searchQuery, categoryFilter, statusFilter]);

  const activeFilterCount = [categoryFilter, statusFilter].filter(Boolean).length;

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
        icon={ImageIcon}
        title={`Gallery Items (${filteredImages.length})`}
        subtitle="Manage gallery images displayed on the public gallery page"
        actions={
          <div className="flex items-center gap-3">
            {/* Reorder Mode Toggle */}
            <button
              onClick={() => {
                if (isReorderMode && hasOrderChanged) {
                  // Exiting reorder mode with unsaved changes
                  if (confirm('You have unsaved changes. Save before exiting?')) {
                    saveOrder().then(() => setIsReorderMode(false));
                  } else {
                    setIsReorderMode(false);
                    setHasOrderChanged(false);
                  }
                } else {
                  setIsReorderMode(!isReorderMode);
                }
              }}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm",
                isReorderMode
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  : "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <ArrowUpDown className="w-4 h-4" />
              {isReorderMode ? 'Exit Reorder' : 'Reorder'}
            </button>

            {/* Save Order Button (only in reorder mode) */}
            {isReorderMode && hasOrderChanged && (
              <button
                onClick={saveOrder}
                disabled={isSavingOrder}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-all flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {isSavingOrder ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Order
              </button>
            )}

            {/* Add Image Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg font-medium hover:from-sky-500 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Image
            </button>
          </div>
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
              placeholder="Search images..."
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
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filter by Category</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategoryFilter(null)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      categoryFilter === null
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                        categoryFilter === category
                          ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                  onClick={() => setStatusFilter('active')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                    statusFilter === 'active'
                      ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Eye className="w-3 h-3" />
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter('inactive')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                    statusFilter === 'inactive'
                      ? "bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <EyeOff className="w-3 h-3" />
                  Inactive
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reorder Mode Banner */}
        {isReorderMode && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-amber-700 dark:text-amber-300 font-medium text-sm">Reorder Mode Active</p>
              <p className="text-amber-600/80 dark:text-amber-400/80 text-xs">Drag and drop images to reorder. Click "Save Order" when done.</p>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {filteredImages.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800">
            <ImageIcon className="w-12 h-12 text-gray-400 dark:text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No images found</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm">
              {images.length === 0
                ? "Get started by uploading your first gallery image."
                : "Try adjusting your search or filters."}
            </p>
            {images.length === 0 && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-6 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium hover:from-sky-500 hover:to-blue-500 transition-all text-sm"
              >
                Upload Image
              </button>
            )}
          </div>
        ) : isReorderMode ? (
          /* Reorder Mode - Draggable List */
          <Reorder.Group
            axis="y"
            values={images}
            onReorder={handleReorder}
            className="space-y-3"
          >
            {images.map((image, index) => (
              <Reorder.Item
                key={image.id}
                value={image}
                className="rounded-xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 overflow-hidden cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center gap-4 p-3">
                  {/* Drag Handle */}
                  <div className="flex items-center gap-2 text-gray-400 dark:text-zinc-500">
                    <GripVertical className="w-5 h-5" />
                    <span className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-lg text-sm font-medium text-gray-600 dark:text-zinc-400">
                      {index + 1}
                    </span>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-zinc-800 flex-shrink-0">
                    <Image
                      src={image.thumbnailUrl || image.blobUrl}
                      alt={image.altText || image.title || 'Gallery image'}
                      fill
                      className="object-cover"
                      unoptimized={image.blobUrl?.includes('localhost')}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {image.title || 'Untitled'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {image.category && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {image.category}
                        </span>
                      )}
                      <span className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded flex items-center gap-1",
                        image.status === 'active'
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                      )}>
                        {image.status === 'active' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {image.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(image);
                    }}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      image.status === 'active'
                        ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                    )}
                    title={image.status === 'active' ? 'Click to disable' : 'Click to enable'}
                  >
                    {image.status === 'active' ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          /* Normal Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 overflow-hidden transition-all group"
              >
                {/* Image Preview */}
                <div className="relative aspect-square bg-gray-100 dark:bg-zinc-800">
                  <Image
                    src={image.thumbnailUrl || image.blobUrl}
                    alt={image.altText || image.title || 'Gallery image'}
                    fill
                    className="object-cover"
                    unoptimized={image.blobUrl?.includes('localhost')}
                  />
                  {/* Order Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="w-7 h-7 flex items-center justify-center bg-black/60 text-white text-xs font-medium rounded-lg">
                      {image.sortOrder ?? index + 1}
                    </span>
                  </div>
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleToggleStatus(image)}
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition-colors",
                        image.status === 'active'
                          ? "bg-green-500/90 text-white hover:bg-green-600"
                          : "bg-gray-500/90 text-white hover:bg-gray-600"
                      )}
                      title={image.status === 'active' ? 'Click to disable' : 'Click to enable'}
                    >
                      {image.status === 'active' ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Hidden
                        </>
                      )}
                    </button>
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setImageToEdit(image)}
                      className="p-2 bg-white/90 hover:bg-white rounded-lg text-gray-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setImageToDelete(image)}
                      className="p-2 bg-white/90 hover:bg-white rounded-lg text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Image Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {image.title || 'Untitled'}
                  </h3>
                  {image.category && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {image.category}
                    </span>
                  )}
                  <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          categories={categories}
        />
      )}

      {imageToEdit && (
        <EditModal
          image={imageToEdit}
          onClose={() => setImageToEdit(null)}
          onSave={handleEdit}
          categories={categories}
        />
      )}

      {imageToDelete && (
        <DeleteModal
          image={imageToDelete}
          onConfirm={() => handleDelete(imageToDelete)}
          onCancel={() => setImageToDelete(null)}
        />
      )}
    </Layout>
  );
}
