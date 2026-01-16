'use client';

import { useState, useCallback } from 'react';
import type {
  CalendarEvent,
  CreateCalendarEventDTO,
  UpdateCalendarEventDTO,
  CalendarEventFilters,
  CalendarEventStatus,
} from '@/types/calendar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface UseCalendarOptions {
  initialDate?: Date;
}

interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
}

interface CalendarActions {
  fetchEvents: (filters: CalendarEventFilters) => Promise<void>;
  getEvent: (id: string) => Promise<CalendarEvent | null>;
  getUpcoming: (limit?: number) => Promise<CalendarEvent[]>;
  createEvent: (data: CreateCalendarEventDTO) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, data: UpdateCalendarEventDTO) => Promise<CalendarEvent | null>;
  updateEventStatus: (id: string, status: CalendarEventStatus) => Promise<CalendarEvent | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useCalendar(options: UseCalendarOptions = {}): CalendarState & CalendarActions {
  const [state, setState] = useState<CalendarState>({
    events: [],
    loading: false,
    error: null,
  });
  
  const [currentFilters, setCurrentFilters] = useState<CalendarEventFilters | null>(null);

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const buildQueryString = useCallback((filters: CalendarEventFilters): string => {
    const params = new URLSearchParams();
    
    params.append('startDate', filters.startDate);
    params.append('endDate', filters.endDate);
    
    if (filters.eventType) params.append('eventType', filters.eventType);
    if (filters.status) params.append('status', filters.status);
    if (filters.contactId) params.append('contactId', filters.contactId);
    if (filters.jobId) params.append('jobId', filters.jobId);
    if (filters.assignedUserId) params.append('assignedUserId', String(filters.assignedUserId));
    if (filters.expand) params.append('expand', 'true');
    
    return params.toString();
  }, []);

  const fetchEvents = useCallback(async (filters: CalendarEventFilters): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    setCurrentFilters(filters);
    
    try {
      const queryString = buildQueryString(filters);
      const response = await fetch(`${API_BASE}/api/v1/calendar/events?${queryString}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to fetch events');
      }
      
      const result = await response.json();
      const events = result.data as CalendarEvent[];
      
      setState(prev => ({
        ...prev,
        events,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [buildQueryString, getAuthHeaders]);

  const getEvent = useCallback(async (id: string): Promise<CalendarEvent | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/calendar/events/${id}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return null;
      }
      
      const result = await response.json();
      return result.data as CalendarEvent;
    } catch (error) {
      return null;
    }
  }, [getAuthHeaders]);

  const getUpcoming = useCallback(async (limit: number = 10): Promise<CalendarEvent[]> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/calendar/events/upcoming?limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return [];
      }
      
      const result = await response.json();
      return result.data as CalendarEvent[];
    } catch (error) {
      return [];
    }
  }, [getAuthHeaders]);

  const createEvent = useCallback(async (data: CreateCalendarEventDTO): Promise<CalendarEvent | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/calendar/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create event');
      }
      
      const result = await response.json();
      const newEvent = result.data as CalendarEvent;
      
      // Add to local state
      setState(prev => ({
        ...prev,
        events: [...prev.events, newEvent],
      }));
      
      return newEvent;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create event',
      }));
      return null;
    }
  }, [getAuthHeaders]);

  const updateEvent = useCallback(async (id: string, data: UpdateCalendarEventDTO): Promise<CalendarEvent | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/calendar/events/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update event');
      }
      
      const result = await response.json();
      const updatedEvent = result.data as CalendarEvent;
      
      // Update local state
      setState(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === id ? updatedEvent : e),
      }));
      
      return updatedEvent;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update event',
      }));
      return null;
    }
  }, [getAuthHeaders]);

  const updateEventStatus = useCallback(async (id: string, status: CalendarEventStatus): Promise<CalendarEvent | null> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/calendar/events/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update event status');
      }
      
      const result = await response.json();
      const updatedEvent = result.data as CalendarEvent;
      
      setState(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === id ? updatedEvent : e),
      }));
      
      return updatedEvent;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update status',
      }));
      return null;
    }
  }, [getAuthHeaders]);

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/calendar/events/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        return false;
      }
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        events: prev.events.filter(e => e.id !== id),
      }));
      
      return true;
    } catch (error) {
      return false;
    }
  }, [getAuthHeaders]);

  const refresh = useCallback(async () => {
    if (currentFilters) {
      await fetchEvents(currentFilters);
    }
  }, [currentFilters, fetchEvents]);

  return {
    ...state,
    fetchEvents,
    getEvent,
    getUpcoming,
    createEvent,
    updateEvent,
    updateEventStatus,
    deleteEvent,
    refresh,
  };
}
