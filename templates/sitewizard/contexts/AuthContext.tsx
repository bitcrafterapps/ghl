'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getApiUrl } from '@/lib/api';

interface UserProfile {
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  companyId?: number | null;
}

interface AuthContextType {
  userProfile: UserProfile | null;
  isProfileLoaded: boolean;
  refreshProfile: () => Promise<void>;
  clearProfile: () => void;
  isImpersonating: boolean;
  impersonateUser: (token: string) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const isMountedRef = useRef(true);

  // Load cached profile on mount
  useEffect(() => {
    const cached = localStorage.getItem('userProfile');
    if (cached) {
      try {
        setUserProfile(JSON.parse(cached));
      } catch {
        // Invalid cache
      }
    }
    
    // Check for impersonation status
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsImpersonating(true);
    }

    setIsProfileLoaded(true);
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (isMountedRef.current) {
        setUserProfile(data);
        localStorage.setItem('userProfile', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setUserProfile(null);
    localStorage.removeItem('userProfile');
  }, []);

  const impersonateUser = useCallback((newToken: string) => {
    const currentToken = localStorage.getItem('token');
    if (currentToken) {
      localStorage.setItem('adminToken', currentToken);
    }
    localStorage.setItem('token', newToken);
    localStorage.removeItem('userProfile'); // Clear cache to force reload
    
    // Force reload to reset all app state/sockets with new token
    window.location.href = '/dashboard';
  }, []);

  const stopImpersonation = useCallback(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      localStorage.setItem('token', adminToken);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userProfile'); // Clear cache
      
      // Force reload to restore admin session
      window.location.href = '/users';
    }
  }, []);

  return (
    <AuthContext.Provider value={{ userProfile, isProfileLoaded, refreshProfile, clearProfile, isImpersonating, impersonateUser, stopImpersonation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
