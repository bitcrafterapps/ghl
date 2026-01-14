'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './useSocket';

interface PresenceUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  color: string;
  cursor?: { x: number; y: number };
  activity?: string;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
];

export function usePresence(projectId: string) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { socket, isConnected } = useSocket({ projectId });

  useEffect(() => {
    if (!socket) return;

    // Handle presence updates
    socket.on('presence:users', (data: { users: PresenceUser[] }) => {
      setUsers(data.users.map((user, i) => ({
        ...user,
        color: user.color || COLORS[i % COLORS.length],
      })));
    });

    socket.on('presence:join', (user: PresenceUser) => {
      setUsers(prev => {
        if (prev.find(u => u.id === user.id)) return prev;
        return [...prev, { ...user, color: COLORS[prev.length % COLORS.length] }];
      });
    });

    socket.on('presence:leave', (data: { id: string }) => {
      setUsers(prev => prev.filter(u => u.id !== data.id));
    });

    socket.on('presence:typing', (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (data.isTyping && !prev.includes(data.userId)) {
          return [...prev, data.userId];
        } else if (!data.isTyping) {
          return prev.filter(id => id !== data.userId);
        }
        return prev;
      });
    });

    socket.on('presence:activity', (data: { userId: string; activity: string }) => {
      setUsers(prev => prev.map(u => 
        u.id === data.userId ? { ...u, activity: data.activity } : u
      ));
    });

    return () => {
      socket.off('presence:users');
      socket.off('presence:join');
      socket.off('presence:leave');
      socket.off('presence:typing');
      socket.off('presence:activity');
    };
  }, [socket]);

  const setTyping = useCallback((isTyping: boolean) => {
    if (socket) {
      socket.emit('presence:typing', { projectId, isTyping });
    }
  }, [socket, projectId]);

  const updateActivity = useCallback((activity: string) => {
    if (socket) {
      socket.emit('presence:activity', { projectId, activity });
    }
  }, [socket, projectId]);

  return {
    users,
    typingUsers,
    isConnected,
    setTyping,
    updateActivity,
  };
}

export type { PresenceUser };
