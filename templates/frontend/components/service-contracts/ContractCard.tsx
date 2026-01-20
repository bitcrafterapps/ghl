'use client';

import type { ServiceContract } from '@/types/service-contracts';
import { CONTRACT_STATUS_COLORS, BILLING_FREQUENCY_LABELS, SERVICE_FREQUENCY_LABELS } from '@/types/service-contracts';
import { cn } from '@/lib/utils';
import { Calendar, DollarSign, User, Clock, MoreVertical, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface ContractCardProps {
  contract: ServiceContract;
  onView?: (contract: ServiceContract) => void;
  onEdit?: (contract: ServiceContract) => void;
  onDelete?: (contract: ServiceContract) => void;
  onRenew?: (contract: ServiceContract) => void;
}

export function ContractCard({ contract, onView, onEdit, onDelete, onRenew }: ContractCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const statusColors = CONTRACT_STATUS_COLORS[contract.status];
  
  const contactName = contract.contact 
    ? [contract.contact.firstName, contract.contact.lastName].filter(Boolean).join(' ')
    : null;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const isExpiringSoon = contract.endDate && 
    new Date(contract.endDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;
  
  return (
    <div className="group relative bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/5 p-5 transition-all duration-300 hover:border-gray-300 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-[#1C1C1C] hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-500">{contract.contractNumber}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
            {contract.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-full border',
            statusColors.bg,
            statusColors.text,
            statusColors.border
          )}>
            {statusColors.label}
          </span>
          
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {menuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-40 bg-white dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-white/10 shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  {onView && (
                    <button
                      onClick={() => { onView(contract); setMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => { onEdit(contract); setMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                  )}
                  {onRenew && contract.status !== 'cancelled' && (
                    <button
                      onClick={() => { onRenew(contract); setMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-500/10 flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Renew
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => { onDelete(contract); setMenuOpen(false); }}
                      className="w-full px-3 py-2 text-left text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2"
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
      
      {/* Contact */}
      {contactName && (
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 dark:text-gray-400">
          <User className="w-4 h-4" />
          <span>{contactName}</span>
        </div>
      )}
      
      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <DollarSign className="w-4 h-4 text-green-500 dark:text-green-400" />
          <span>{formatCurrency(contract.amount)}/{BILLING_FREQUENCY_LABELS[contract.billingFrequency].toLowerCase()}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          <span>{SERVICE_FREQUENCY_LABELS[contract.serviceFrequency]}</span>
        </div>
      </div>
      
      {/* Dates */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5 text-xs">
        <div className="text-gray-400 dark:text-gray-500">
          Start: <span className="text-gray-600 dark:text-gray-400">{formatDate(contract.startDate)}</span>
        </div>
        {contract.endDate && (
          <div className={cn(
            "text-gray-400 dark:text-gray-500",
            isExpiringSoon && contract.status === 'active' && "text-orange-500 dark:text-orange-400"
          )}>
            Ends: <span className={isExpiringSoon && contract.status === 'active' ? "text-orange-500 dark:text-orange-400" : "text-gray-600 dark:text-gray-400"}>
              {formatDate(contract.endDate)}
            </span>
          </div>
        )}
      </div>
      
      {/* Services */}
      {contract.servicesIncluded && contract.servicesIncluded.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
          {contract.servicesIncluded.slice(0, 3).map((service, i) => (
            <span 
              key={i}
              className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
            >
              {service}
            </span>
          ))}
          {contract.servicesIncluded.length > 3 && (
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
              +{contract.servicesIncluded.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
