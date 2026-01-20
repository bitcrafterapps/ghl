'use client';

import { useState, useRef } from 'react';
import type { PhotoType } from '@/types/job-photos';
import { PHOTO_TYPE_COLORS } from '@/types/job-photos';
import { cn } from '@/lib/utils';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  onUpload: (file: File, data: { photoType: PhotoType; title?: string; caption?: string }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const PHOTO_TYPES: { value: PhotoType; label: string }[] = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'progress', label: 'Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'issue', label: 'Issue' },
  { value: 'materials', label: 'Materials' },
  { value: 'other', label: 'Other' },
];

export function PhotoUpload({ onUpload, onCancel, isLoading }: PhotoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<PhotoType>('other');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    await onUpload(file, { photoType, title: title || undefined, caption: caption || undefined });
  };
  
  const inputClasses = "w-full px-4 py-2.5 bg-[#1C1C1C] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all";
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Upload Photo</h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              preview
                ? "border-pink-500 bg-pink-500/5"
                : "border-gray-700 hover:border-pink-500 hover:bg-pink-500/5"
            )}
          >
            {preview ? (
              <div className="relative aspect-video max-h-48 mx-auto">
                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
              </div>
            ) : (
              <>
                <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400 mb-1">Drag and drop an image or click to browse</p>
                <p className="text-sm text-gray-600">JPEG, PNG, GIF, WebP (max 10MB)</p>
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
          
          {/* Photo Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Photo Type</label>
            <div className="flex flex-wrap gap-2">
              {PHOTO_TYPES.map(type => {
                const colors = PHOTO_TYPE_COLORS[type.value];
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setPhotoType(type.value)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-lg border transition-all",
                      photoType === type.value
                        ? cn(colors.bg, colors.text, colors.border)
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1.5">Title (optional)</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClasses}
              placeholder="e.g., Kitchen Before Work"
            />
          </div>
          
          {/* Caption */}
          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-gray-300 mb-1.5">Caption (optional)</label>
            <input
              type="text"
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className={inputClasses}
              placeholder="Add a caption for this photo"
            />
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-pink-600 hover:bg-pink-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
