'use client';

import { useState, useEffect } from 'react';
import {  Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { getApiUrl } from '@/lib/api';

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  emailNotify: boolean;
  smsNotify?: boolean;
  phoneNumber?: string;
  theme: 'light' | 'dark';
  primaryColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'teal' | 'pink' | 'yellow' | 'indigo' | 'cyan';
  id: string;
}

export default function ProfilePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('dark');
  const [activePrimaryColor, setActivePrimaryColor] = useState<'blue' | 'purple' | 'green' | 'red' | 'orange' | 'teal' | 'pink' | 'yellow' | 'indigo' | 'cyan'>('blue');
  const { theme, setTheme, primaryColor, setPrimaryColor } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const apiUrl = getApiUrl();
      console.log('Profile: Using API URL:', apiUrl);
      
      // Fetch user profile
      fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
        .then(res => {
          console.log('Profile: Profile response status:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('Profile: Profile data received:', data);
          // Handle v1 API response format
          const userData = data.data || data;
          setProfile(userData);
          setIsAdmin(userData.roles?.includes('Admin'));
          if (userData.phoneNumber) {
            setPhoneNumber(formatPhoneNumber(userData.phoneNumber));
          }
          setIsLoading(false);
          
          // Set theme based on user preference from the database
          if (userData.theme) {
            setActiveTheme(userData.theme);
            setTheme(userData.theme);
            localStorage.setItem('theme', userData.theme);
          }
          
          // Set primary color based on user preference
          if (userData.primaryColor) {
            setActivePrimaryColor(userData.primaryColor);
            setPrimaryColor(userData.primaryColor);
            localStorage.setItem('primaryColor', userData.primaryColor);
          }
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
          setIsLoading(false);
        });
    }
  }, []);

  // Format phone number with mask (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string) => {
    // Strip non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 0) {
      return '';
    }
    
    if (numbers.length <= 3) {
      return `(${numbers}`;
    }
    
    if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    }
    
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(formatPhoneNumber(value));
  };

  // Strip formatting from phone number to get just the digits
  const stripPhoneNumberFormatting = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const handlePersonalInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const updates = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phoneNumber: stripPhoneNumberFormatting(phoneNumber)
    };

    try {
      const apiUrl = getApiUrl();
      console.log('Profile: Updating personal info:', updates);
      
      const response = await fetch(`${apiUrl}/api/v1/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      console.log('Profile: Update response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const responseData = await response.json();
      console.log('Profile: Update response data:', responseData);
      
      // Handle v1 API response format
      const updatedProfile = responseData.data || responseData;
      setProfile(updatedProfile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword')?.toString() || '';
    const newPassword = formData.get('newPassword')?.toString() || '';
    const confirmPassword = formData.get('confirmPassword')?.toString() || '';

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      return;
    }

    try {
      const apiUrl = getApiUrl();
      console.log('Profile: Changing password');
      
      const response = await fetch(`${apiUrl}/api/v1/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      console.log('Profile: Password change response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to update password');
      }

      const result = await response.json();
      console.log('Profile: Password change response data:', result);
      
      // Handle v1 API response format
      const message = result.data?.message || result.message || 'Password updated successfully';
      setMessage({ type: 'success', text: message });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update password. Please try again.'
      });
    }
  };

  const handlePrimaryColorChange = (color: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'teal' | 'pink' | 'yellow' | 'indigo' | 'cyan') => {
    setActivePrimaryColor(color);
    setPrimaryColor(color);
    
    // Also save to localStorage for persistence
    localStorage.setItem('primaryColor', color);

    // Save color preference to the API immediately
    if (profile?.id) {
      try {
        const apiUrl = getApiUrl();
        console.log('Profile: Updating primary color preference:', color);
        
        fetch(`${apiUrl}/api/v1/users/${profile.id}/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
          body: JSON.stringify({
            emailNotify: profile.emailNotify,
            theme: activeTheme,
            primaryColor: color
          }),
        })
          .then(response => {
            if (!response.ok) {
              console.error('Failed to update primary color preference');
            } else {
              response.json().then(data => {
                console.log('Profile: Primary color update response data:', data);
                
                // Handle v1 API response format
                const updatedProfile = data.data || data;
                setProfile(updatedProfile);
              });
            }
          })
          .catch(error => {
            console.error('Error updating primary color preference:', error);
          });
      } catch (error) {
        console.error('Error updating primary color preference:', error);
      }
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    
    const updates = {
      emailNotify: formData.get('emailNotifications') === 'on',
      theme: formData.get('theme') as 'light' | 'dark',
      primaryColor: activePrimaryColor
    };

    try {
      if (!profile?.id) {
        throw new Error('User ID not found');
      }

      const apiUrl = getApiUrl();
      console.log('Profile: Updating preferences:', updates);
      
      const response = await fetch(`${apiUrl}/api/v1/users/${profile.id}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      console.log('Profile: Preferences update response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to update preferences');
      }

      const responseData = await response.json();
      console.log('Profile: Preferences update response data:', responseData);
      
      // Handle v1 API response format
      const updatedProfile = responseData.data || responseData;
      setProfile(updatedProfile);
      
      // Also update the global theme when preferences are saved
      setTheme(updates.theme);
      localStorage.setItem('theme', updates.theme);
      
      // Update primary color
      setPrimaryColor(updates.primaryColor);
      localStorage.setItem('primaryColor', updates.primaryColor);
      
      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update preferences. Please try again.'
      });
    }
  };

  useEffect(() => {
    // Set initial theme based on profile
    if (profile?.theme) {
      setActiveTheme(profile.theme);
    }
  }, [profile]);

  const handleThemeToggle = async (theme: 'light' | 'dark') => {
    setActiveTheme(theme);
    setTheme(theme);
    
    // Also save to localStorage for persistence
    localStorage.setItem('theme', theme);

    // Save theme preference to the API immediately
    if (profile?.id) {
      try {
        const apiUrl = getApiUrl();
        console.log('Profile: Updating theme preference:', theme);
        
        const response = await fetch(`${apiUrl}/api/v1/users/${profile.id}/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include',
          body: JSON.stringify({
            emailNotify: profile.emailNotify,
            theme: theme
          }),
        });

        console.log('Profile: Theme update response status:', response.status);
        
        if (!response.ok) {
          console.error('Failed to update theme preference');
        } else {
          const responseData = await response.json();
          console.log('Profile: Theme update response data:', responseData);
          
          // Handle v1 API response format
          const updatedProfile = responseData.data || responseData;
          setProfile(updatedProfile);
        }
      } catch (error) {
        console.error('Error updating theme preference:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
        <div className="main-content min-h-screen flex-1 p-6">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="h-8 w-8 border-4 border-t-[#205ab2] border-opacity-20 border-t-opacity-100 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
      <SubHeader 
        icon={UserCircle}
        title="My Profile"
        subtitle="Manage your account settings and preferences"
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">

          {/* Message Display */}
          {message && (
            <div className={cn(
              "mb-8 p-4 rounded-md border",
              message.type === 'success' 
                ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-500' 
                : 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-500'
            )}>
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-[#2A2A2A] mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('personal')}
                className={cn(
                  "py-4 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === 'personal'
                    ? "border-current accent-text accent-border"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#3A3A3A]"
                )}
              >
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={cn(
                  "py-4 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === 'security'
                    ? "border-current accent-text accent-border"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#3A3A3A]"
                )}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={cn(
                  "py-4 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === 'preferences'
                    ? "border-current accent-text accent-border"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#3A3A3A]"
                )}
              >
                Preferences
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="content-card border content-border rounded-lg p-6">
            {/* Personal Information Form */}
            {activeTab === 'personal' && (
              <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    defaultValue={profile?.email}
                    className="w-full px-3 py-2 content-input border content-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    defaultValue={profile?.firstName}
                    className="w-full px-3 py-2 content-input border content-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    defaultValue={profile?.lastName}
                    className="w-full px-3 py-2 content-input border content-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="w-full px-3 py-2 content-input border content-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors accent-bg"
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            )}

            {/* Security Form */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    className="w-full px-3 py-2 content-input border content-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    className="w-full px-3 py-2 content-input border content-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="w-full px-3 py-2 content-input border content-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-colors accent-bg"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            )}

            {/* Preferences Form */}
            {activeTab === 'preferences' && (
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-4">
                    Notifications
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="emailNotifications"
                        id="emailNotifications"
                        defaultChecked={profile?.emailNotify}
                        className="h-4 w-4 text-[#205ab2] border-content-border rounded focus:ring-[#205ab2]"
                      />
                      <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Email Notifications
                      </label>
                    </div>
                  </div>
                </div>

                {/* Theme Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-4">
                    Theme
                  </label>
                  <div className="flex rounded-md overflow-hidden w-fit border content-border">
                    <input 
                      type="hidden" 
                      name="theme" 
                      value={activeTheme} 
                    />
                    <button 
                      type="button"
                      onClick={() => handleThemeToggle('light')}
                      className={`px-4 py-2 text-sm transition-colors ${
                        activeTheme === 'light' 
                          ? 'accent-bg text-white font-medium' 
                          : 'bg-gray-100 dark:content-input text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:content-hover-effect'
                      }`}
                    >
                      Light
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleThemeToggle('dark')}
                      className={`px-4 py-2 text-sm transition-colors ${
                        activeTheme === 'dark' 
                          ? 'accent-bg text-white font-medium' 
                          : 'bg-gray-100 dark:content-input text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:content-hover-effect'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Primary Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-4">
                    Primary Color
                  </label>
                  <div className="color-selector w-full max-w-2xl">
                    <button
                      type="button"
                      onClick={() => handlePrimaryColorChange('blue')}
                      className={`color-option ${activePrimaryColor === 'blue' ? 'active' : ''}`}
                      style={{ backgroundColor: '#205ab2' }}
                      aria-label="Blue"
                    />
                    <button
                      type="button"
                      onClick={() => handlePrimaryColorChange('purple')}
                      className={`color-option ${activePrimaryColor === 'purple' ? 'active' : ''}`}
                      style={{ backgroundColor: '#7c3aed' }}
                      aria-label="Purple"
                    />
                    <button
                      type="button"
                      onClick={() => handlePrimaryColorChange('green')}
                      className={`color-option ${activePrimaryColor === 'green' ? 'active' : ''}`}
                      style={{ backgroundColor: '#16a34a' }}
                      aria-label="Green"
                    />
                    <button
                      type="button"
                      onClick={() => handlePrimaryColorChange('red')}
                      className={`color-option ${activePrimaryColor === 'red' ? 'active' : ''}`}
                      style={{ backgroundColor: '#dc2626' }}
                      aria-label="Red"
                    />
                    <button
                      type="button"
                      onClick={() => handlePrimaryColorChange('orange')}
                      className={`color-option ${activePrimaryColor === 'orange' ? 'active' : ''}`}
                      style={{ backgroundColor: '#ea580c' }}
                      aria-label="Orange"
                    />
                    <button
                      type="button"
                      onClick={() => handlePrimaryColorChange('teal')}
                      className={`color-option ${activePrimaryColor === 'teal' ? 'active' : ''}`}
                      style={{ backgroundColor: '#0d9488' }}
                      aria-label="Teal"
                    />
                    <button
                      type="button"
                      onClick={() => handlePrimaryColorChange('pink')}
                      className={`color-option ${activePrimaryColor === 'pink' ? 'active' : ''}`}
                      style={{ backgroundColor: '#ec4899' }}
                      aria-label="Pink"
                    />
                    <button
                      type="button"
                      onClick={() => handlePrimaryColorChange('yellow')}
                      className={`color-option ${activePrimaryColor === 'yellow' ? 'active' : ''}`}
                      style={{ backgroundColor: '#eab308' }}
                      aria-label="Yellow"
                    />
                    <button
                      type="button"
                      onClick={() => handlePrimaryColorChange('indigo')}
                      className={`color-option ${activePrimaryColor === 'indigo' ? 'active' : ''}`}
                      style={{ backgroundColor: '#4f46e5' }}
                      aria-label="Indigo"
                    />
                    <button
                      type="button"
                      onClick={() => handlePrimaryColorChange('cyan')}
                      className={`color-option ${activePrimaryColor === 'cyan' ? 'active' : ''}`}
                      style={{ backgroundColor: '#06b6d4' }}
                      aria-label="Cyan"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#205ab2] text-white rounded-md hover:bg-[#202272] transition-colors accent-bg"
                  >
                    Save Preferences
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
    </Layout>
  );
} 