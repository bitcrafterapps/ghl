'use client';

import { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { UserCircle, Mail, User, Shield, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';
import { logActivity } from '@/lib/activity'; // Keep for potential future use
import { getApiUrl } from '@/lib/api';

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles: string[];
  emailNotify: boolean;
  smsNotify?: boolean;
  phoneNumber: string;
  theme: 'light' | 'dark';
}

type TabType = 'account' | 'personal' | 'settings';

export default function UserEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNewUser = params.id === 'new';
  const searchParams = new URLSearchParams(window.location.search);
  const companyId = searchParams.get('companyId');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState<UserFormData>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const rolesParam = searchParams.get('roles');
    const initialRoles = rolesParam ? rolesParam.split(',') : ['User'];
    
    return {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      roles: initialRoles,
      emailNotify: true,
      smsNotify: false,
      phoneNumber: '',
      theme: 'dark'
    };
  });

  const tabs = [
    { id: 'account' as TabType, label: 'Account', icon: Mail },
    { id: 'personal' as TabType, label: 'Personal', icon: User },
    { id: 'settings' as TabType, label: 'Settings', icon: Shield },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Fetch user profile to check admin status
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setIsAdmin(data.roles?.includes('Admin'));
          setIsSiteAdmin(data.roles?.includes('Site Admin'));
          if (!isNewUser) {
            // Fetch user data if editing
            const apiUrl = getApiUrl();
            return fetch(`${apiUrl}/api/v1/users/${params.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          }
        })
        .then(res => {
          if (res && !isNewUser) {
            return res.json();
          }
        })
        .then(userData => {
          if (userData) {
            setFormData({
              email: userData.email,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              password: '',
              roles: userData.roles,
              emailNotify: userData.emailNotify,
              smsNotify: userData.smsNotify,
              phoneNumber: userData.phoneNumber || '',
              theme: userData.theme
            });
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          setMessage({ type: 'error', text: 'Failed to load user data' });
          setIsLoading(false);
        });
    }
  }, [isNewUser, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSaving(true);
    
    try {
      // Create submission data, excluding password if empty
      const { 
        smsNotify, // Extract to remove from payload
        ...submissionData 
      } = {
        ...formData,
        companyId: companyId ? parseInt(companyId) : undefined
      };
      
      // Remove password if it's empty
      if (!submissionData.password) {
        delete submissionData.password;
      }

      const response = await fetch(
        isNewUser ? '/api/v1/users' : `/api/v1/users/${params.id}`,
        {
          method: isNewUser ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(submissionData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save user');
      }

      const savedUser = await response.json();

      // Navigate back to the appropriate page
      if (companyId) {
        router.push(`/companies/${companyId}`);
      } else {
        router.push('/users');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save user'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleToggle = (role: string) => {
    // Only lock User role if coming from company page AND not an admin
    if (companyId && role === 'User' && !isAdmin && !isSiteAdmin) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const availableRoles = useMemo(() => {
    if (isSiteAdmin) {
      return ['Site Admin', 'Admin', 'User'];
    }
    return ['Admin', 'User'];
  }, [isSiteAdmin]);

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
      <div className="bg-gray-50 dark:bg-zinc-950 min-h-screen">
        <SubHeader 
          icon={UserCircle}
          title={isNewUser ? 'Add New User' : 'Edit User'}
          subtitle={isNewUser ? 'Create a new user account' : 'Update user information and settings'}
        />

        <div className="max-w-3xl mx-auto py-8 px-4">

          {/* Message Display */}
          {message && (
            <div className={cn(
              "mb-6 p-4 rounded-xl border text-sm",
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
            )}>
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-zinc-800 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 -mb-px",
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-white border-blue-500"
                    : "text-gray-500 dark:text-zinc-400 border-transparent hover:text-gray-700 dark:hover:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-700"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Account Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder="user@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                      {isNewUser ? 'Password' : 'New Password'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={isNewUser}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder={isNewUser ? '••••••••' : 'Leave blank to keep current'}
                    />
                    {!isNewUser && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">Leave blank to keep current password</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Roles */}
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Roles & Permissions</h2>
                  
                  <div className="flex flex-wrap gap-3">
                    {[...(['User', 'Admin']), ...(isSiteAdmin ? ['Site Admin'] : [])].map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleToggle(role)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                          formData.roles.includes(role)
                            ? role === 'Site Admin' 
                              ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30" 
                              : role === 'Admin'
                              ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30"
                              : "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30"
                            : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:text-gray-900 dark:hover:text-zinc-300"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="emailNotify"
                      id="emailNotify"
                      checked={formData.emailNotify}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <div>
                      <span className="text-gray-900 dark:text-white text-sm font-medium group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">Email Notifications</span>
                      <p className="text-gray-500 dark:text-zinc-500 text-xs">Receive updates and alerts via email</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => companyId ? router.push(`/companies/${companyId}`) : router.push('/users')}
                className="px-6 py-3 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium hover:from-sky-500 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isNewUser ? 'Create User' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}