'use client';

import { useState, useEffect } from 'react';
import type { ContactFilters as ContactFiltersType, ContactStatus, ContactSource } from '@/types/contacts';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactFiltersProps {
  filters: ContactFiltersType;
  onFiltersChange: (filters: ContactFiltersType) => void;
  totalCount?: number;
}

const STATUS_OPTIONS: { value: ContactStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal Sent' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

const SOURCE_OPTIONS: { value: ContactSource; label: string }[] = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social Media' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'event', label: 'Event' },
  { value: 'ghl', label: 'GoHighLevel' },
  { value: 'manual', label: 'Manual Entry' },
  { value: 'other', label: 'Other' },
];

export function ContactFiltersBar({ filters, onFiltersChange, totalCount }: ContactFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');
  
  const activeFilterCount = [
    filters.status && (Array.isArray(filters.status) ? filters.status.length : 1),
    filters.source && (Array.isArray(filters.source) ? filters.source.length : 1),
  ].filter(Boolean).reduce((a, b) => (a || 0) + (b || 0), 0) || 0;
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchValue });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Debouncing search:', searchValue);
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, filters, onFiltersChange]);
  
  const handleStatusChange = (status: ContactStatus) => {
    const currentStatuses = Array.isArray(filters.status) 
      ? filters.status 
      : filters.status ? [filters.status] : [];
    
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    onFiltersChange({ 
      ...filters, 
      status: newStatuses.length ? newStatuses : undefined 
    });
  };
  
  const handleSourceChange = (source: ContactSource) => {
    const currentSources = Array.isArray(filters.source) 
      ? filters.source 
      : filters.source ? [filters.source] : [];
    
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source];
    
    onFiltersChange({ 
      ...filters, 
      source: newSources.length ? newSources : undefined 
    });
  };
  
  const clearFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };
  
  const hasActiveFilters = filters.search || filters.status || filters.source;
  
  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
        </form>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
            showFilters || activeFilterCount > 0
              ? "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/30 text-blue-600 dark:text-blue-400"
              : "bg-white dark:bg-[#1C1C1C] border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20"
          )}
        >
          <Filter className="w-5 h-5" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            showFilters && "rotate-180"
          )} />
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-3 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      
      {/* Results Count */}
      {totalCount !== undefined && (
        <p className="text-sm text-gray-500">
          {totalCount} {totalCount === 1 ? 'contact' : 'contacts'} found
        </p>
      )}
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="p-5 bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Status Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Status</h4>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(option => {
                const isSelected = Array.isArray(filters.status)
                  ? filters.status.includes(option.value)
                  : filters.status === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusChange(option.value)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-lg border transition-all",
                      isSelected
                        ? "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/50 text-blue-600 dark:text-blue-400"
                        : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Source Filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Source</h4>
            <div className="flex flex-wrap gap-2">
              {SOURCE_OPTIONS.map(option => {
                const isSelected = Array.isArray(filters.source)
                  ? filters.source.includes(option.value)
                  : filters.source === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSourceChange(option.value)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-lg border transition-all",
                      isSelected
                        ? "bg-blue-500/10 dark:bg-blue-500/20 border-blue-500/50 text-blue-600 dark:text-blue-400"
                        : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
