'use client';

import type { CalendarEvent } from '@/types/calendar';
import { EVENT_TYPE_COLORS, formatTime } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Clock, MapPin, User, Video } from 'lucide-react';

interface EventCardProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}

export function EventCard({ event, onClick, compact = false }: EventCardProps) {
  const typeColors = EVENT_TYPE_COLORS[event.eventType];
  
  const contactName = event.contact 
    ? [event.contact.firstName, event.contact.lastName].filter(Boolean).join(' ')
    : null;
  
  if (compact) {
    return (
      <button
        onClick={() => onClick?.(event)}
        className={cn(
          "w-full text-left px-2 py-1 rounded text-xs truncate transition-colors",
          typeColors.bg,
          typeColors.text,
          "hover:opacity-80"
        )}
      >
        <span className="font-medium">{formatTime(event.startTime)}</span>
        <span className="ml-1">{event.title}</span>
      </button>
    );
  }
  
  return (
    <div
      onClick={() => onClick?.(event)}
      className={cn(
        "group p-3 rounded-lg border cursor-pointer transition-all",
        typeColors.bg,
        typeColors.border,
        "hover:opacity-90 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cn("font-medium truncate", typeColors.text)}>
            {event.title}
          </p>
          
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </span>
          </div>
        </div>
        
        <span className={cn(
          "flex-shrink-0 px-2 py-0.5 text-[10px] font-medium rounded",
          typeColors.bg,
          typeColors.text
        )}>
          {typeColors.label}
        </span>
      </div>
      
      {(contactName || event.location || event.isVirtual) && (
        <div className="mt-2 space-y-1">
          {contactName && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User className="w-3 h-3" />
              <span className="truncate">{contactName}</span>
            </div>
          )}
          
          {event.isVirtual ? (
            <div className="flex items-center gap-1.5 text-xs text-blue-400">
              <Video className="w-3 h-3" />
              <span>Virtual Meeting</span>
            </div>
          ) : event.location && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
