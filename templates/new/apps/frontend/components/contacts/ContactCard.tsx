'use client';

import type { Contact, ContactStatus } from '@/types/contacts';
import { CONTACT_STATUS_COLORS, SOURCE_LABELS } from '@/types/contacts';
import { cn } from '@/lib/utils';
import { Mail, Phone, MapPin, Building2, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ContactCardProps {
  contact: Contact;
  onView?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  viewMode?: 'grid' | 'list';
}

export function ContactCard({ contact, viewMode = 'grid', onView, onEdit, onDelete }: ContactCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const statusColors = CONTACT_STATUS_COLORS[contact.status];
  
  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  const location = [contact.city, contact.state].filter(Boolean).join(', ');
  
  if (viewMode === 'list') {
    return (
      <div className={cn(
        "group relative bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/5 p-4 transition-all duration-300 hover:border-gray-300 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-[#1C1C1C] hover:z-10 flex items-center gap-4",
        menuOpen && "z-20"
      )}>
        {/* Name & Company */}
        <div className="flex-1 min-w-[200px]">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
            {fullName}
          </h3>
          {contact.contactCompanyName && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <Building2 className="w-3.5 h-3.5" />
              <span className="truncate">{contact.contactCompanyName}</span>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="flex-[2] hidden md:grid grid-cols-2 gap-4">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{contact.email}</span>
            </a>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{contact.phone}</span>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="w-32 flex-shrink-0">
          <span className={cn(
            'px-2.5 py-1 text-xs font-medium rounded-full border capitalize',
            statusColors.bg,
            statusColors.text,
            statusColors.border
          )}>
            {contact.status.replace('_', ' ')}
          </span>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-white/10 shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {onView && (
                  <button onClick={() => { onView(contact); setMenuOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> View
                  </button>
                )}
                {onEdit && (
                  <button onClick={() => { onEdit(contact); setMenuOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => { onDelete(contact); setMenuOpen(false); }} className="w-full px-3 py-2 text-left text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "group relative bg-white dark:bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-white/5 p-5 transition-all duration-300 hover:border-gray-300 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-[#1C1C1C] hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:z-10",
      menuOpen && "z-20"
    )}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className={cn(
          'px-2.5 py-1 text-xs font-medium rounded-full border capitalize',
          statusColors.bg,
          statusColors.text,
          statusColors.border
        )}>
          {contact.status.replace('_', ' ')}
        </span>
        
        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {menuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-white/10 shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                {onView && (
                  <button
                    onClick={() => { onView(contact); setMenuOpen(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => { onEdit(contact); setMenuOpen(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { onDelete(contact); setMenuOpen(false); }}
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
      
      {/* Contact Info */}
      <div className="space-y-4">
        {/* Name & Company */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate pr-24">
            {fullName}
          </h3>
          {contact.contactCompanyName && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500 dark:text-gray-400">
              <Building2 className="w-3.5 h-3.5" />
              <span className="truncate">{contact.contactCompanyName}</span>
            </div>
          )}
        </div>
        
        {/* Contact Details */}
        <div className="space-y-2">
          {contact.email && (
            <a 
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{contact.email}</span>
            </a>
          )}
          {contact.phone && (
            <a 
              href={`tel:${contact.phone}`}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>{contact.phone}</span>
            </a>
          )}
          {location && (
            <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{location}</span>
            </div>
          )}
        </div>
        
        {/* Footer - Source & Tags */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {SOURCE_LABELS[contact.source] || contact.source}
          </span>
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex gap-1">
              {contact.tags.slice(0, 2).map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
              {contact.tags.length > 2 && (
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                  +{contact.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
