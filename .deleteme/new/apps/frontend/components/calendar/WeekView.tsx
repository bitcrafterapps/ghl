'use client';

import { useMemo } from 'react';
import type { CalendarEvent } from '@/types/calendar';
import { getWeekDays, isSameDay, isToday, formatTime } from '@/types/calendar';
import { EventCard } from './EventCard';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekView({ date, events, onEventClick, onTimeSlotClick }: WeekViewProps) {
  const weekDays = useMemo(() => getWeekDays(date), [date]);
  
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    
    events.forEach(event => {
      const eventDate = new Date(event.startTime);
      const key = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
      
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(event);
    });
    
    return map;
  }, [events]);
  
  const getEventsForDay = (day: Date): CalendarEvent[] => {
    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
    return eventsByDay.get(key) || [];
  };
  
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };
  
  return (
    <div className="bg-[#1C1C1C]/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-8 bg-[#0a0a0f]/50 border-b border-white/5">
        {/* Time column header */}
        <div className="px-2 py-3 text-center text-xs font-medium text-gray-600"></div>
        
        {/* Day headers */}
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={cn(
              "px-2 py-3 text-center border-l border-white/5",
              isToday(day) && "bg-blue-600/10"
            )}
          >
            <p className="text-xs font-medium text-gray-500 uppercase">{WEEKDAYS[day.getDay()]}</p>
            <p className={cn(
              "text-lg font-semibold mt-1",
              isToday(day) ? "text-blue-400" : "text-white"
            )}>
              {day.getDate()}
            </p>
          </div>
        ))}
      </div>
      
      {/* Time Grid */}
      <div className="max-h-[600px] overflow-y-auto">
        <div className="grid grid-cols-8">
          {/* Time labels */}
          <div className="divide-y divide-white/5">
            {HOURS.map(hour => (
              <div key={hour} className="h-12 px-2 py-1 text-right">
                <span className="text-xs text-gray-600">{formatHour(hour)}</span>
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            
            return (
              <div
                key={dayIndex}
                className={cn(
                  "relative border-l border-white/5 divide-y divide-white/5",
                  isToday(day) && "bg-blue-600/5"
                )}
              >
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    onClick={() => onTimeSlotClick?.(day, hour)}
                    className="h-12 hover:bg-white/5 cursor-pointer transition-colors"
                  />
                ))}
                
                {/* Events overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {dayEvents.map(event => {
                    const startTime = new Date(event.startTime);
                    const endTime = new Date(event.endTime);
                    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                    
                    return (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 pointer-events-auto"
                        style={{
                          top: `${startHour * 48}px`,
                          height: `${Math.max(duration * 48, 20)}px`,
                        }}
                      >
                        <EventCard
                          event={event}
                          onClick={onEventClick}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
