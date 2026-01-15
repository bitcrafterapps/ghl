'use client';

import { LucideIcon } from 'lucide-react';

interface SubHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function SubHeader({ icon: Icon, title, subtitle, actions }: SubHeaderProps) {
  return (
    <header className="border-b border-[--subheader-border] dark:border-zinc-800 bg-[--subheader-bg] dark:bg-none dark:bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-40">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[--subheader-text-primary]">{title}</h1>
            {subtitle && <p className="text-[10px] text-[--subheader-text-secondary]">{subtitle}</p>}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
