'use client';

import { Layout } from '@/components/Layout';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useJobPhotos } from '@/hooks/useJobPhotos';
import { useJobs } from '@/hooks/useJobs';
import { PhotoCard } from '@/components/job-photos/PhotoCard';
import { PhotoUpload } from '@/components/job-photos/PhotoUpload';
import type { JobPhoto, PhotoType } from '@/types/job-photos';
import { PHOTO_TYPE_COLORS } from '@/types/job-photos';
import type { Job } from '@/types/jobs';
import {
  Image as ImageIcon,
  Plus,
  Loader2,
  RefreshCw,
  Filter,
  X,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function JobPhotosContent() {
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get('jobId');
  
  const {
    photos,
    pairs,
    loading,
    error,
    fetchPhotos,
    uploadPhoto,
    deletePhoto,
    publishToGallery,
    unpublishFromGallery,
    refresh,
  } = useJobPhotos();
  
  const { jobs, fetchJobs } = useJobs();
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [filterType, setFilterType] = useState<PhotoType | 'all'>('all');
  const [viewPhoto, setViewPhoto] = useState<JobPhoto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<JobPhoto | null>(null);
  const [showJobSelector, setShowJobSelector] = useState(false);
  
  useEffect(() => {
    fetchJobs();
  }, []);
  
  useEffect(() => {
    if (jobIdParam && jobs.length > 0) {
      const job = jobs.find(j => j.id === jobIdParam);
      if (job) {
        setSelectedJob(job);
        fetchPhotos(job.id);
      }
    }
  }, [jobIdParam, jobs]);
  
  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    fetchPhotos(job.id);
    setShowJobSelector(false);
  };
  
  const handleUpload = async (file: File, data: { photoType: PhotoType; title?: string; caption?: string }) => {
    if (!selectedJob) return;
    setUploadLoading(true);
    try {
      await uploadPhoto(selectedJob.id, file, data);
      setShowUpload(false);
    } finally {
      setUploadLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deletePhoto(deleteConfirm.id);
    setDeleteConfirm(null);
  };
  
  const filteredPhotos = filterType === 'all' 
    ? photos 
    : photos.filter(p => p.photoType === filterType);
  
  return (
    <div className="bg-[#0a0a0f] min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl">
                <ImageIcon className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Job Photos</h1>
                <p className="text-sm text-gray-500">Manage before/after photos and publish to gallery</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => refresh()}
                disabled={loading || !selectedJob}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
              </button>
              
              {selectedJob && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl shadow-lg shadow-pink-500/25 transition-all transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Upload Photo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Job Selector */}
        <div className="mb-8">
          <div className="relative">
            <button
              onClick={() => setShowJobSelector(!showJobSelector)}
              className="w-full max-w-md flex items-center justify-between px-4 py-3 bg-[#1C1C1C] border border-white/10 rounded-xl text-left hover:border-white/20 transition-colors"
            >
              {selectedJob ? (
                <div>
                  <p className="text-sm text-gray-500">{selectedJob.jobNumber}</p>
                  <p className="text-white font-medium">{selectedJob.title}</p>
                </div>
              ) : (
                <span className="text-gray-400">Select a job to view photos</span>
              )}
              <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", showJobSelector && "rotate-180")} />
            </button>
            
            {showJobSelector && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowJobSelector(false)} />
                <div className="absolute top-full left-0 mt-2 w-full max-w-md max-h-80 overflow-y-auto bg-[#1C1C1C] border border-white/10 rounded-xl shadow-xl z-20">
                  {jobs.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No jobs available</div>
                  ) : (
                    jobs.map(job => (
                      <button
                        key={job.id}
                        onClick={() => handleSelectJob(job)}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0",
                          selectedJob?.id === job.id && "bg-pink-500/10"
                        )}
                      >
                        <p className="text-xs text-gray-500">{job.jobNumber}</p>
                        <p className="text-white">{job.title}</p>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        
        {!selectedJob ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-gray-500/10 rounded-full mb-4">
              <ImageIcon className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Select a Job</h3>
            <p className="text-gray-500 max-w-md">
              Choose a job from the dropdown above to view and manage its photos.
            </p>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterType('all')}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg border whitespace-nowrap transition-all",
                  filterType === 'all'
                    ? "bg-pink-500/20 border-pink-500/50 text-pink-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                )}
              >
                All ({photos.length})
              </button>
              {Object.entries(PHOTO_TYPE_COLORS).map(([type, colors]) => {
                const count = photos.filter(p => p.photoType === type).length;
                if (count === 0) return null;
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as PhotoType)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-lg border whitespace-nowrap transition-all",
                      filterType === type
                        ? cn(colors.bg, colors.border, colors.text)
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    )}
                  >
                    {colors.label} ({count})
                  </button>
                );
              })}
            </div>
            
            {/* Error State */}
            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                {error}
              </div>
            )}
            
            {/* Loading State */}
            {loading && photos.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
              </div>
            )}
            
            {/* Empty State */}
            {!loading && photos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 bg-gray-500/10 rounded-full mb-4">
                  <ImageIcon className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No photos yet</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Upload photos to document your work on this job.
                </p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-pink-600 hover:bg-pink-500 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Upload First Photo
                </button>
              </div>
            )}
            
            {/* Photos Grid */}
            {filteredPhotos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredPhotos.map(photo => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onView={setViewPhoto}
                    onDelete={setDeleteConfirm}
                    onPublish={(p) => publishToGallery(p.id)}
                    onUnpublish={(p) => unpublishFromGallery(p.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Upload Modal */}
      {showUpload && (
        <PhotoUpload
          onUpload={handleUpload}
          onCancel={() => setShowUpload(false)}
          isLoading={uploadLoading}
        />
      )}
      
      {/* View Photo Modal */}
      {viewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <button
            onClick={() => setViewPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-4xl max-h-[90vh]">
            <Image
              src={viewPhoto.blobUrl}
              alt={viewPhoto.title || 'Job photo'}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              unoptimized={viewPhoto.blobUrl.includes('localhost')}
            />
            {viewPhoto.title && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-medium">{viewPhoto.title}</p>
                {viewPhoto.caption && (
                  <p className="text-gray-300 text-sm">{viewPhoto.caption}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-[#1C1C1C] border border-white/10 rounded-2xl shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-2">Delete Photo</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this photo? This action cannot be undone.
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
    </div>
  );
}

export default function JobPhotosPage() {
  return (
    <Layout isAuthenticated={true} noPadding>
      <Suspense fallback={
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      }>
        <JobPhotosContent />
      </Suspense>
    </Layout>
  );
}
