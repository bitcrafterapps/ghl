'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { Building2, Users, Save, Loader2, MapPin, Mail, Phone, UserPlus, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';
import { logActivity } from '@/lib/activity';
import { getApiUrl } from '@/lib/api';

// Helper function to safely format dates
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

interface CompanyFormData {
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  industry: string;
  size: string;
}

interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: string[];
  emailNotify: boolean;
  smsNotify: boolean;
  phoneNumber: string | null;
  theme: 'light' | 'dark';
  createdAt?: string;
  updatedAt?: string;
  joinedAt?: string;
}

interface DeleteModalProps {
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ user, onConfirm, onCancel }: DeleteModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmEnabled = confirmText === 'delete';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Remove User</h3>
        <p className="text-gray-500 dark:text-zinc-400 mb-6 text-center text-sm">
          Are you sure you want to remove <span className="text-gray-900 dark:text-white font-medium">{user.email}</span> from this company?
        </p>
        <div className="mb-4">
          <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-2">Type <span className="text-gray-900 dark:text-white font-medium">delete</span> to confirm</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="delete"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmEnabled}
            className={cn(
              "flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              isConfirmEnabled
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
            )}
          >
            Remove User
          </button>
        </div>
      </div>
    </div>
  );
}

type TabType = 'basic' | 'address' | 'contact' | 'users';

export default function CompanyEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNewCompany = params.id === 'new';
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    addressLine1: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    phone: '',
    industry: '',
    size: ''
  });

  const tabs = [
    { id: 'basic' as TabType, label: 'Basic Info', icon: Building2 },
    { id: 'address' as TabType, label: 'Address', icon: MapPin },
    { id: 'contact' as TabType, label: 'Contact', icon: Mail },
    { id: 'users' as TabType, label: `Users (${users.length})`, icon: Users },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const apiUrl = getApiUrl();
      fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch user profile');
          }
          return res.json();
        })
        .then(data => {
          const hasSiteAdminRole = data.roles?.includes('Site Admin');
          const hasAdminRole = data.roles?.includes('Admin');
          const isOwnCompany = data.companyId && String(data.companyId) === String(params.id);
          
          setIsAdmin(hasSiteAdminRole || hasAdminRole);
          
          // Allow access if admin OR if accessing own company
          if (!hasSiteAdminRole && !hasAdminRole && !isOwnCompany) {
            router.push('/404');
            return;
          }

          if (!isNewCompany) {
            return fetch(`${apiUrl}/api/v1/companies/${params.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          }
        })
        .then(res => {
          if (res && !isNewCompany) {
            return res.json();
          }
        })
        .then(companyData => {
          if (companyData) {
            const company = companyData.company || companyData;
            
            setFormData({
              name: company.name || '',
              addressLine1: company.addressLine1 || '',
              city: company.city || '',
              state: company.state || '',
              zip: company.zip || '',
              email: company.email || '',
              phone: company.phone || '',
              industry: company.industry || '',
              size: company.size || ''
            });
            
            setUsers(companyData.users || []);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          setMessage({ type: 'error', text: 'Failed to load company data' });
          setIsLoading(false);
        });
    }
  }, [isNewCompany, params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSaving(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'Authentication required' });
      router.push('/login');
      return;
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(
        isNewCompany ? `${apiUrl}/api/v1/companies` : `${apiUrl}/api/v1/companies/${params.id}`,
        {
          method: isNewCompany ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save company');
      }

      const savedCompany = await response.json();

      await logActivity({
        type: 'company',
        action: isNewCompany ? 'created' : 'updated',
        title: `Company "${savedCompany.name}"`,
        entityId: savedCompany.id
      });

      setMessage({ type: 'success', text: `Company ${isNewCompany ? 'created' : 'updated'} successfully` });
      
      setTimeout(() => {
        router.push('/companies');
      }, 1500);
    } catch (error) {
      console.error('Error saving company:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save company'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditUser = (user: User) => {
    router.push(`/users/${user.id}?companyId=${params.id}`);
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/v1/companies/${params.id}/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove user from company');
      }

      await logActivity({
        type: 'company',
        action: 'deleted',
        title: `Removed user "${user.email}" from company`,
        entityId: parseInt(params.id as string)
      });

      setUsers(users.filter(u => u.id !== user.id));
      setMessage({ type: 'success', text: 'User removed from company successfully' });
    } catch (error) {
      console.error('Error:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to remove user from company'
      });
    } finally {
      setUserToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
      <SubHeader 
        icon={Building2}
        title={isNewCompany ? 'Add New Company' : (formData.name || 'Edit Company')}
        subtitle={isNewCompany ? 'Create a new company account' : 'Manage company details and users'}
      />

      <div className="max-w-4xl mx-auto py-8 px-4">

        {/* Message Display */}
        {message && (
          <div className={cn(
            "mb-6 p-4 rounded-xl border text-sm",
            message.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          )}>
            {message.text}
          </div>
        )}

        {/* Tabs (only show if editing) */}
        {!isNewCompany && (
          <div className="flex border-b border-zinc-800 mb-6">
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
        )}

        {/* Basic Info Tab */}
        {(activeTab === 'basic' || isNewCompany) && (
          <form onSubmit={handleSubmit}>
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Basic Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="Acme Corporation"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                      Industry
                    </label>
                    <select
                      name="industry"
                      id="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    >
                      <option value="">Select an industry</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="education">Education</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="consulting">Consulting</option>
                      <option value="government">Government</option>
                      <option value="nonprofit">Nonprofit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="size" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                      Company Size
                    </label>
                    <select
                      name="size"
                      id="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => router.push('/companies')}
                className="px-6 py-3 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm font-medium"
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
                    {isNewCompany ? 'Create Company' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && !isNewCompany && (
          <form onSubmit={handleSubmit}>
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-500 dark:text-green-400" />
                Address
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder="San Francisco"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      id="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      maxLength={2}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm uppercase"
                      placeholder="CA"
                    />
                  </div>

                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                      ZIP
                    </label>
                    <input
                      type="text"
                      name="zip"
                      id="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      maxLength={5}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      placeholder="94102"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end pt-6">
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
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && !isNewCompany && (
          <form onSubmit={handleSubmit}>
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-zinc-400 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end pt-6">
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
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !isNewCompany && (
          <div>
            {/* Add User Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => router.push(`/users/new?companyId=${params.id}&roles=User,Admin`)}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium hover:from-sky-500 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Add User
              </button>
            </div>

            {/* Users List */}
            {users.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800">
                <Users className="w-12 h-12 text-gray-400 dark:text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users yet</h3>
                <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">Add users to this company to get started.</p>
                <button
                  onClick={() => router.push(`/users/new?companyId=${params.id}&roles=User,Admin`)}
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium hover:from-sky-500 hover:to-blue-500 transition-all text-sm"
                >
                  Add First User
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div 
                    key={user.id}
                    onClick={() => handleEditUser(user)}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-sky-500/10 dark:from-blue-500/20 dark:to-sky-500/20 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                            {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user.email}
                            </h3>
                            <div className="flex gap-1">
                              {user.roles.map((role) => (
                                <span 
                                  key={role}
                                  className={cn(
                                    "px-2 py-0.5 text-xs font-medium rounded-md",
                                    role === 'Admin' 
                                      ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30" 
                                      : role === 'Site Admin'
                                      ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/30"
                                      : "bg-gray-100 dark:bg-zinc-700 text-gray-500 dark:text-zinc-400"
                                  )}
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 dark:text-zinc-500">
                          Joined {formatDate(user.joinedAt || user.createdAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserToDelete(user);
                          }}
                          className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          aria-label="Remove user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-zinc-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <DeleteModal
          user={userToDelete}
          onConfirm={() => handleDeleteUser(userToDelete)}
          onCancel={() => setUserToDelete(null)}
        />
      )}
    </Layout>
  );
}