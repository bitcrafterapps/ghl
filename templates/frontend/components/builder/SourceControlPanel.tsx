'use client';

import React, { useState } from 'react';
import { 
  GitBranch, 
  GitCommit, 
  RefreshCw, 
  MoreHorizontal, 
  Check, 
  Plus, 
  Minus, 
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Search,
  FileCode,
  FileJson,
  FileType,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

export function SourceControlPanel() {
  const [commitMessage, setCommitMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const stagedChanges = [
    { file: 'apps/web/src/components/Header.tsx', type: 'M', path: 'apps/web/src/components' },
    { file: 'apps/api/src/routes/index.ts', type: 'M', path: 'apps/api/src/routes' },
  ];
  
  const changes = [
    { file: 'apps/web/src/app/page.tsx', type: 'M', path: 'apps/web/src/app' },
    { file: 'packages/ui/src/Button.tsx', type: 'M', path: 'packages/ui/src' },
    { file: 'README.md', type: 'M', path: '.' },
  ];

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc] font-sans text-sm select-none border-r border-[#333]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-bold tracking-wide uppercase text-[#bbbbbb] bg-[#252526]">
        <span>Source Control</span>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-[#3c3c3c] rounded" title="View as Tree">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button 
            className={clsx("p-1 hover:bg-[#3c3c3c] rounded", isSyncing && "animate-spin")} 
            onClick={handleSync}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Branch / Action Bar */}
        <div className="px-2 py-3 flex flex-col gap-2 border-b border-[#333]">
          <div className="flex items-center justify-between text-[13px] px-2">
            <div className="flex items-center gap-2 hover:bg-[#2a2d2e] py-1 px-1 rounded cursor-pointer transition-colors w-full">
              <GitBranch className="w-3.5 h-3.5" />
              <span className="font-medium">main*</span>
              <span className="text-[10px] text-[#888] ml-auto flex items-center gap-1">
                <ArrowDown className="w-3 h-3" /> 0
                <ArrowUp className="w-3 h-3 ml-2" /> 1
              </span>
            </div>
          </div>
        </div>

        {/* Commit Input Area */}
        <div className="p-3 pb-4">
          <div className="relative">
            <textarea 
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Message (Ctrl+Enter to commit)"
              className="w-full bg-[#3c3c3c] border border-[#3c3c3c] focus:border-[#007fd4] text-white p-2 text-sm rounded-sm min-h-[80px] outline-none placeholder-[#888] resize-y font-mono"
            />
          </div>
          <button 
            className="mt-2 w-full bg-[#007fd4] hover:bg-[#026ec1] text-white py-1.5 px-3 rounded-sm flex items-center justify-center gap-2 text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!commitMessage}
          >
            <Check className="w-4 h-4" />
            Commit
          </button>
        </div>

        {/* Staged Changes */}
        <div className="pt-2">
          <SectionHeader title="Staged Changes" count={stagedChanges.length} />
          <div className="flex flex-col">
            {stagedChanges.map((file, i) => (
              <FileItem key={i} file={file} />
            ))}
          </div>
        </div>

        {/* Changes */}
        <div className="pt-2">
          <SectionHeader title="Changes" count={changes.length} />
          <div className="flex flex-col">
            {changes.map((file, i) => (
              <FileItem key={i} file={file} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string, count: number }) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div 
      className="flex items-center gap-1 px-1 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[11px] font-bold text-[#bbbbbb] uppercase tracking-wide"
      onClick={() => setIsOpen(!isOpen)}
    >
      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      <span>{title}</span>
      <span className="bg-[#444] text-white rounded-full px-1.5 py-0.5 text-[10px] ml-1">{count}</span>
      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <Plus className="w-3.5 h-3.5 hover:text-white" />
        <RotateCcw className="w-3.5 h-3.5 hover:text-white" />
      </div>
    </div>
  );
}

function FileItem({ file }: { file: { file: string, type: string, path: string } }) {
  return (
    <div className="group flex items-center gap-2 px-4 py-1 hover:bg-[#2a2d2e] cursor-pointer text-[13px] text-[#cccccc]">
      <div className="flex-shrink-0 text-[#dcb67a]">
        {file.file.endsWith('.tsx') || file.file.endsWith('.ts') ? (
          <FileCode className="w-4 h-4" />
        ) : file.file.endsWith('.json') ? (
          <FileJson className="w-4 h-4" />
        ) : (
          <FileType className="w-4 h-4" />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="truncate leading-tight">{file.file.split('/').pop()}</span>
        <span className="text-[11px] text-[#666] truncate leading-tight">{file.path}</span>
      </div>
      <div className="ml-auto text-[11px] font-medium opacity-100 px-1.5 py-0.5 rounded-sm">
        <span className="text-[#dcb67a]">M</span>
      </div>
      <div className="hidden group-hover:flex items-center gap-2 ml-2">
        <button className="text-[#cccccc] hover:bg-[#444] rounded p-0.5" title="Stage Changes">
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button className="text-[#cccccc] hover:bg-[#444] rounded p-0.5" title="Discard Changes">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
