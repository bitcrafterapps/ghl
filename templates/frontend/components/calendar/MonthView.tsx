'use client';

import { useMemo } from 'react';
import type { CalendarEvent } from '@/types/calendar';
import { getCalendarDays, isSameDay, isToday, EVENT_TYPE_COLORS, formatTime } from '@/types/calendar';
import { EventCard } from './EventCard';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthView({ year, month, events, onEventClick, onDateClick }: MonthViewProps) {
  const days = useMemo(() => getCalendarDays(year, month), [year, month]);
  
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    
    events.forEach(event => {
      const date = new Date(event.startTime);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(event);
    });
    
    // Sort events by start time
    map.forEach((dayEvents) => {
      dayEvents.sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });
    
    return map;
  }, [events]);
  
  const getEventsForDay = (date: Date): CalendarEvent[] => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventsByDay.get(key) || [];
  };
  
  return (
    <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-[#0a0a0f]/50 border-b border-white/5">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((date, index) => {
          const dayEvents = getEventsForDay(date);
          const isCurrentMonth = date.getMonth() === month;
          const isTodayDate = isToday(date);
          
          return (
            <div
              key={index}
              onClick={() => onDateClick?.(date)}
              className={cn(
                "min-h-[120px] p-2 border-b border-r border-white/5 cursor-pointer transition-colors",
                isCurrentMonth ? "bg-[#1C1C1C]/50" : "bg-[#0a0a0f]/30",
                "hover:bg-[#1C1C1C]"
              )}
            >
              {/* Date Number */}
              <div className="flex justify-between items-start mb-2">
                <span
                  className={cn(
                    "w-7 h-7 flex items-center justify-center rounded-lg text-sm font-medium",
                    isTodayDate 
                      ? "bg-blue-600 text-white" 
                      : isCurrentMonth 
                        ? "text-gray-300" 
                        : "text-gray-600"
                  )}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-gray-500">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
              
              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    compact
                    onClick={onEventClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
