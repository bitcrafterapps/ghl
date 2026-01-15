'use client';

import { useState } from 'react';
import { FileText, Clock, CheckCircle, MessageSquare, Edit3, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type PrdStatus = 'draft' | 'interviewing' | 'review' | 'approved';

interface PRD {
  id: string;
  projectId: string;
  version: number;
  status: PrdStatus;
  sections?: {
    overview?: {
      name?: string;
      description?: string;
    };
    features?: Array<{ name: string }>;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
  projectName?: string;
  projectDescription?: string;
  projectUserId?: number;
  projectCompanyId?: number | null;
  companyName?: string;
  isOwner?: boolean;
  ownerName?: string;
}

interface PRDCardProps {
  prd: PRD;
  currentUserId?: number;
}

const statusConfig: Record<PrdStatus, { bg: string; text: string; border: string; icon: any; label: string }> = {
  draft: {
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    border: 'border-zinc-500/20',
    icon: Edit3,
    label: 'Draft'
  },
  interviewing: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    icon: MessageSquare,
    label: 'Interviewing'
  },
  review: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    border: 'border-yellow-500/20',
    icon: Clock,
    label: 'In Review'
  },
  approved: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/20',
    icon: CheckCircle,
    label: 'Approved'
  },
};

export function PRDCard({ prd, currentUserId }: PRDCardProps) {
  const status = (prd.status as PrdStatus) || 'draft';
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  // Get PRD name from sections or fallback to project name
  const prdName = prd.sections?.overview?.name || prd.projectName || 'Untitled PRD';
  const prdDescription = prd.sections?.overview?.description || prd.projectDescription || 'No description available';
  const featureCount = prd.sections?.features?.length || 0;

  // Check if this is a team project
  const isTeamProject = !!prd.projectCompanyId;
  const isOwner = prd.projectUserId === currentUserId;

  return (
    <Link
      href={`/builder/${prd.projectId}`}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col h-full hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
    >
      {/* Top Row: Icon + Status */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/20 border border-blue-500/20 flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-400" />
        </div>
        <div className={cn(
          "px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5",
          config.bg,
          config.text,
          config.border
        )}>
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mb-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
          {prdName}
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
          {prdDescription}
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <span className="font-medium text-zinc-300">{featureCount}</span>
          <span>Features</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500">
          <span>v{prd.version}</span>
        </div>
      </div>

      {/* Meta Row */}
      <div className="flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          {isTeamProject ? (
            <>
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-400">{prd.companyName || 'Team'}</span>
              {!isOwner && prd.ownerName && (
                <span className="text-zinc-500">• {prd.ownerName}</span>
              )}
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Personal</span>
            </>
          )}
        </div>
        <span>
          Updated {new Date(prd.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </Link>
  );
}
