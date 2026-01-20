'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Eye } from 'lucide-react';

export function ImpersonationBanner() {
  const { isImpersonating, stopImpersonation, userProfile } = useAuth();

  if (!isImpersonating) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] w-auto animate-slide-up">
      <div className="bg-amber-500 text-black px-6 py-3 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-4 border-2 border-amber-400 font-medium">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          <span>
            Viewing as <span className="font-bold">{userProfile?.email}</span>
          </span>
        </div>
        
        <div className="h-4 w-px bg-black/20" />
        
        <button 
          onClick={stopImpersonation}
          className="flex items-center gap-2 hover:bg-black/10 px-3 py-1 rounded-full transition-colors text-sm font-bold"
        >
          <LogOut className="w-4 h-4" />
          Back to Admin
        </button>
      </div>
    </div>
  );
}
