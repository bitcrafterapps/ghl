'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { JobPhoto } from '@/types/job-photos';
import { PHOTO_TYPE_COLORS } from '@/types/job-photos';
import { cn } from '@/lib/utils';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Share2, 
  Globe,
  GripVertical
} from 'lucide-react';

interface PhotoCardProps {
  photo: JobPhoto;
  onView?: (photo: JobPhoto) => void;
  onEdit?: (photo: JobPhoto) => void;
  onDelete?: (photo: JobPhoto) => void;
  onPublish?: (photo: JobPhoto) => void;
  onUnpublish?: (photo: JobPhoto) => void;
  draggable?: boolean;
}

export function PhotoCard({ 
  photo, 
  onView, 
  onEdit, 
  onDelete, 
  onPublish, 
  onUnpublish,
  draggable = false 
}: PhotoCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const typeColors = PHOTO_TYPE_COLORS[photo.photoType];
  
  return (
    <div className="group relative bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-lg hover:shadow-black/20">
      {/* Image */}
      <div 
        className="relative aspect-[4/3] bg-gray-900 cursor-pointer"
        onClick={() => onView?.(photo)}
      >
        <Image
          src={photo.thumbnailUrl || photo.blobUrl}
          alt={photo.title || 'Job photo'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized={photo.blobUrl.includes('localhost')}
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Eye className="w-8 h-8 text-white" />
        </div>
        
        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={cn(
            "px-2 py-0.5 text-xs font-medium rounded border",
            typeColors.bg,
            typeColors.text,
            typeColors.border
          )}>
            {typeColors.label}
          </span>
        </div>
        
        {/* Published Badge */}
        {photo.publishedToGallery && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Published
            </span>
          </div>
        )}
        
        {/* Drag Handle */}
        {draggable && (
          <div className="absolute bottom-2 left-2 p-1 rounded bg-black/50 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {photo.title && (
              <p className="text-sm font-medium text-white truncate">{photo.title}</p>
            )}
            {photo.caption && (
              <p className="text-xs text-gray-500 truncate mt-0.5">{photo.caption}</p>
            )}
          </div>
          
          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-40 bg-[#2A2A2A] rounded-lg border border-white/10 shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {onView && (
                    <button
                      onClick={() => { onView(photo); setMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => { onEdit(photo); setMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                  )}
                  {photo.publishedToGallery ? (
                    onUnpublish && (
                      <button
                        onClick={() => { onUnpublish(photo); setMenuOpen(false); }}
                        className="w-full px-3 py-2 text-left text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 flex items-center gap-2"
                      >
                        <Globe className="w-4 h-4" /> Unpublish
                      </button>
                    )
                  ) : (
                    onPublish && (
                      <button
                        onClick={() => { onPublish(photo); setMenuOpen(false); }}
                        className="w-full px-3 py-2 text-left text-sm text-green-400 hover:text-green-300 hover:bg-green-500/10 flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" /> Publish to Gallery
                      </button>
                    )
                  )}
                  {onDelete && (
                    <button
                      onClick={() => { onDelete(photo); setMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
