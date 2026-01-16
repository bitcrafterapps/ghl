'use client';

import { useState, useCallback } from 'react';
import type {
  JobPhoto,
  BeforeAfterPair,
  CreateJobPhotoDTO,
  UpdateJobPhotoDTO,
  PhotoFilters,
} from '@/types/job-photos';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface UseJobPhotosState {
  photos: JobPhoto[];
  pairs: BeforeAfterPair[];
  loading: boolean;
  error: string | null;
}

interface UseJobPhotosActions {
  fetchPhotos: (jobId: string) => Promise<void>;
  uploadPhoto: (jobId: string, file: File, data?: Partial<CreateJobPhotoDTO>) => Promise<JobPhoto | null>;
  updatePhoto: (photoId: string, data: UpdateJobPhotoDTO) => Promise<JobPhoto | null>;
  deletePhoto: (photoId: string) => Promise<boolean>;
  reorderPhotos: (jobId: string, photoIds: string[]) => Promise<boolean>;
  createBeforeAfterPair: (jobId: string, beforePhotoId: string, afterPhotoId: string, title?: string) => Promise<BeforeAfterPair | null>;
  deleteBeforeAfterPair: (pairId: string) => Promise<boolean>;
  publishToGallery: (photoId: string) => Promise<boolean>;
  unpublishFromGallery: (photoId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useJobPhotos(): UseJobPhotosState & UseJobPhotosActions {
  const [state, setState] = useState<UseJobPhotosState>({
    photos: [],
    pairs: [],
    loading: false,
    error: null,
  });
  
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchPhotos = useCallback(async (jobId: string): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    setCurrentJobId(jobId);
    
    try {
      const [photosRes, pairsRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/jobs/${jobId}/photos`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE}/api/v1/jobs/${jobId}/photos/pairs`, {
          headers: getAuthHeaders(),
        }),
      ]);
      
      if (!photosRes.ok) {
        throw new Error('Failed to fetch photos');
      }
      
      const photosResult = await photosRes.json();
      const pairsResult = pairsRes.ok ? await pairsRes.json() : { data: [] };
      
      setState(prev => ({
        ...prev,
        photos: photosResult.data || [],
        pairs: pairsResult.data || [],
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [getAuthHeaders]);

  const uploadPhoto = useCallback(async (
    jobId: string,
    file: File,
    data?: Partial<CreateJobPhotoDTO>
  ): Promise<JobPhoto | null> => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('photo', file);
      if (data?.photoType) formData.append('photoType', data.photoType);
      if (data?.title) formData.append('title', data.title);
      if (data?.description) formData.append('description', data.description);
      if (data?.caption) formData.append('caption', data.caption);
      
      const response = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/photos`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }
      
      const result = await response.json();
      const newPhoto = result.data as JobPhoto;
      
      setState(prev => ({
        ...prev,
        photos: [...prev.photos, newPhoto],
      }));
      
      return newPhoto;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to upload photo',
      }));
      return null;
    }
  }, []);

  const updatePhoto = useCallback(async (photoId: string, data: UpdateJobPhotoDTO): Promise<JobPhoto | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/job-photos/${photoId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update photo');
      }
      
      const result = await response.json();
      const updatedPhoto = result.data as JobPhoto;
      
      setState(prev => ({
        ...prev,
        photos: prev.photos.map(p => p.id === photoId ? updatedPhoto : p),
      }));
      
      return updatedPhoto;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update photo',
      }));
      return null;
    }
  }, [getAuthHeaders]);

  const deletePhoto = useCallback(async (photoId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/job-photos/${photoId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return false;
      }
      
      setState(prev => ({
        ...prev,
        photos: prev.photos.filter(p => p.id !== photoId),
      }));
      
      return true;
    } catch (error) {
      return false;
    }
  }, [getAuthHeaders]);

  const reorderPhotos = useCallback(async (jobId: string, photoIds: string[]): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/photos/reorder`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ photoIds }),
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }, [getAuthHeaders]);

  const createBeforeAfterPair = useCallback(async (
    jobId: string,
    beforePhotoId: string,
    afterPhotoId: string,
    title?: string
  ): Promise<BeforeAfterPair | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/jobs/${jobId}/photos/pairs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ beforePhotoId, afterPhotoId, title }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create pair');
      }
      
      const result = await response.json();
      const newPair = result.data as BeforeAfterPair;
      
      setState(prev => ({
        ...prev,
        pairs: [...prev.pairs, newPair],
      }));
      
      return newPair;
    } catch (error) {
      return null;
    }
  }, [getAuthHeaders]);

  const deleteBeforeAfterPair = useCallback(async (pairId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/job-photos/pairs/${pairId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return false;
      }
      
      setState(prev => ({
        ...prev,
        pairs: prev.pairs.filter(p => p.id !== pairId),
      }));
      
      return true;
    } catch (error) {
      return false;
    }
  }, [getAuthHeaders]);

  const publishToGallery = useCallback(async (photoId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/job-photos/${photoId}/publish`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      const updatedPhoto = result.data as JobPhoto;
      
      setState(prev => ({
        ...prev,
        photos: prev.photos.map(p => p.id === photoId ? updatedPhoto : p),
      }));
      
      return true;
    } catch (error) {
      return false;
    }
  }, [getAuthHeaders]);

  const unpublishFromGallery = useCallback(async (photoId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/job-photos/${photoId}/unpublish`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return false;
      }
      
      setState(prev => ({
        ...prev,
        photos: prev.photos.map(p => 
          p.id === photoId 
            ? { ...p, publishedToGallery: false, galleryImageId: undefined }
            : p
        ),
      }));
      
      return true;
    } catch (error) {
      return false;
    }
  }, [getAuthHeaders]);

  const refresh = useCallback(async () => {
    if (currentJobId) {
      await fetchPhotos(currentJobId);
    }
  }, [currentJobId, fetchPhotos]);

  return {
    ...state,
    fetchPhotos,
    uploadPhoto,
    updatePhoto,
    deletePhoto,
    reorderPhotos,
    createBeforeAfterPair,
    deleteBeforeAfterPair,
    publishToGallery,
    unpublishFromGallery,
    refresh,
  };
}
