'use client';

import { Layout } from '@/components/Layout';

import { useEffect, useState, useMemo } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { EventForm } from '@/components/calendar/EventForm';
import { EventCard } from '@/components/calendar/EventCard';
import type { CalendarEvent, CalendarView, CreateCalendarEventDTO } from '@/types/calendar';
import { EVENT_TYPE_COLORS, formatDate, formatTime } from '@/types/calendar';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  RefreshCw,
  LayoutGrid,
  Columns,
  List,
  Clock,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubHeader } from '@/components/SubHeader';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarPage() {
  const {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    refresh,
  } = useCalendar();
  
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState<CalendarEvent | null>(null);
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Calculate date range for current view
  const dateRange = useMemo(() => {
    if (view === 'month') {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      // Extend to include full weeks
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      const endDate = new Date(lastDay);
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
    } else {
      // Week view
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      };
    }
  }, [view, year, month, currentDate]);
  
  // Fetch events when date range changes
  useEffect(() => {
    fetchEvents({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      expand: true,
    });
  }, [dateRange.startDate, dateRange.endDate]);
  
  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };
  
  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleEventClick = (event: CalendarEvent) => {
    setShowEventDetails(event);
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowEventForm(true);
  };
  
  const handleTimeSlotClick = (date: Date, hour: number) => {
    const newDate = new Date(date);
    newDate.setHours(hour, 0, 0, 0);
    setSelectedDate(newDate);
    setShowEventForm(true);
  };
  
  const handleCreateEvent = async (data: CreateCalendarEventDTO) => {
    setFormLoading(true);
    try {
      await createEvent(data);
      setShowEventForm(false);
      setSelectedDate(null);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleUpdateEvent = async (data: CreateCalendarEventDTO) => {
    if (!editingEvent) return;
    setFormLoading(true);
    try {
      await updateEvent(editingEvent.id, data);
      setEditingEvent(null);
      setShowEventDetails(null);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDeleteEvent = async () => {
    if (!showEventDetails) return;
    await deleteEvent(showEventDetails.id);
    setShowEventDetails(null);
  };
  
  const getViewTitle = () => {
    if (view === 'month') {
      return `${MONTHS[month]} ${year}`;
    } else {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      
      if (start.getMonth() === end.getMonth()) {
        return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${MONTHS[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    }
  };
  
  return (
    <Layout isAuthenticated={true} noPadding>
      <div className="bg-[#0a0a0f] min-h-full">
      <SubHeader
        icon={CalendarIcon}
        title="Calendar"
        subtitle="Schedule and manage your events"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => refresh()}
              disabled={loading}
              className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>

            <button
              onClick={() => { setSelectedDate(null); setShowEventForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              New Event
            </button>
          </div>
        }
      />
      
      {/* Toolbar */}
      <div className="sticky top-[73px] z-20 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-full mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Today
              </button>
              
              <h2 className="ml-4 text-lg font-semibold text-white">{getViewTitle()}</h2>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center bg-[#1C1C1C] rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={cn(
                  "p-2 rounded-md transition-colors flex items-center gap-1.5",
                  view === 'month' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-sm">Month</span>
              </button>
              <button
                onClick={() => setView('week')}
                className={cn(
                  "p-2 rounded-md transition-colors flex items-center gap-1.5",
                  view === 'week' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                )}
              >
                <Columns className="w-4 h-4" />
                <span className="text-sm">Week</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-full mx-auto px-6 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}
        
        {/* Loading State */}
        {loading && events.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        )}
        
        {/* Calendar Views */}
        {view === 'month' && (
          <MonthView
            year={year}
            month={month}
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        )}
        
        {view === 'week' && (
          <WeekView
            date={currentDate}
            events={events}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}
      </div>
      
      {/* Event Form Modal */}
      {(showEventForm || editingEvent) && (
        <EventForm
          event={editingEvent}
          initialDate={selectedDate || undefined}
          onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
          onCancel={() => {
            setShowEventForm(false);
            setEditingEvent(null);
            setSelectedDate(null);
          }}
          isLoading={formLoading}
        />
      )}
      
      {/* Event Details Sidebar */}
      {showEventDetails && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowEventDetails(null)}
          />
          <div className="relative w-full max-w-md bg-[#0a0a0f] border-l border-white/10 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Event Details</h3>
              <button
                onClick={() => setShowEventDetails(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Title & Type */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded",
                    EVENT_TYPE_COLORS[showEventDetails.eventType].bg,
                    EVENT_TYPE_COLORS[showEventDetails.eventType].text
                  )}>
                    {EVENT_TYPE_COLORS[showEventDetails.eventType].label}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{showEventDetails.title}</h2>
              </div>
              
              {/* Time */}
              <div className="flex items-center gap-3 text-gray-400">
                <Clock className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-white">{formatDate(showEventDetails.startTime)}</p>
                  <p className="text-sm">
                    {formatTime(showEventDetails.startTime)} - {formatTime(showEventDetails.endTime)}
                  </p>
                </div>
              </div>
              
              {/* Description */}
              {showEventDetails.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                  <p className="text-gray-300">{showEventDetails.description}</p>
                </div>
              )}
              
              {/* Location */}
              {(showEventDetails.location || showEventDetails.isVirtual) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Location</h4>
                  <p className="text-gray-300">
                    {showEventDetails.isVirtual ? 'Virtual Meeting' : showEventDetails.location}
                  </p>
                </div>
              )}
              
              {/* Contact */}
              {showEventDetails.contact && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Contact</h4>
                  <p className="text-white">
                    {showEventDetails.contact.firstName} {showEventDetails.contact.lastName}
                  </p>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#0a0a0f] border-t border-white/10">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingEvent(showEventDetails);
                    setShowEventDetails(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="px-4 py-2.5 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}
