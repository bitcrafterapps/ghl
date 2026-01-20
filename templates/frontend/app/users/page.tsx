'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { Users, Search, X, Trash2, Plus, ChevronRight, Mail, VenetianMask } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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
  createdAt: string;
  updatedAt: string;
}

interface DeleteModalProps {
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ user, onConfirm, onCancel }: DeleteModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmEnabled = confirmText === 'delete';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isConfirmEnabled) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Delete User</h3>
        <p className="text-gray-500 dark:text-zinc-400 mb-6 text-center text-sm">
          Are you sure you want to delete <span className="text-gray-900 dark:text-white font-medium">{user.email}</span>? 
          This action cannot be undone.
        </p>
        <div className="mb-4">
          <label className="block text-sm text-gray-500 dark:text-zinc-400 mb-2">Type <span className="text-gray-900 dark:text-white font-medium">delete</span> to confirm</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="delete"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors rounded-xl border border-gray-200 hover:border-gray-300 dark:border-zinc-700 dark:hover:border-zinc-600 text-sm font-medium"
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
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { impersonateUser } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const apiUrl = getApiUrl();

  const availableRoles = ['User', 'Admin', 'Site Admin'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          const hasSiteAdminRole = data.roles?.includes('Site Admin');
          const hasAdminRole = data.roles?.includes('Admin');
          setIsSiteAdmin(hasSiteAdminRole);
          setIsAdmin(hasAdminRole);
          
          if (!hasSiteAdminRole && !hasAdminRole) {
            router.push('/404');
            return;
          }

          return fetch(`${apiUrl}/api/v1/users`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        })
        .then(res => {
          if (!res) return;
          if (!res.ok) throw new Error('Failed to fetch users');
          return res.json();
        })
        .then(data => {
          if (data) {
            setUsers(data);
            setIsLoading(false);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          toast({
            title: "Error",
            description: "Failed to load users. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
        });
    }
  }, [toast, router, apiUrl]);

  const handleDelete = async (user: User) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(users.filter(u => u.id !== user.id));
      setMessage({ type: 'success', text: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ type: 'error', text: 'Failed to delete user' });
    } finally {
      setUserToDelete(null);
    }
  };

  const handleEdit = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const handleImpersonate = async (user: User) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/admin/impersonate/${user.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start impersonation');
      }

      const data = await response.json();
      impersonateUser(data.token);
      
      toast({
        title: "Impersonation Started",
        description: `You are now impersonating ${user.email}`,
      });
    } catch (error: any) {
      console.error('Impersonation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start impersonation",
        variant: "destructive"
      });
    }
  };

  // Filter users
  const filteredUsers = [...users]
    .filter(user => {
      if (roleFilter.length > 0 && !roleFilter.some(role => user.roles.includes(role))) {
        return false;
      }
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
        
        return (
          user.email.toLowerCase().includes(searchLower) ||
          fullName.includes(searchLower) ||
          user.roles.some(role => role.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => a.email.localeCompare(b.email));

  const toggleRoleFilter = (role: string) => {
    setRoleFilter(prev => 
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter([]);
  };

  if (!isSiteAdmin && !isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isSiteAdmin || isAdmin} noPadding>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isSiteAdmin || isAdmin} noPadding>
      <div className="bg-gray-50 dark:bg-zinc-950 min-h-screen">
        <SubHeader 
          icon={Users}
          title={`Users (${filteredUsers.length})`}
          subtitle="Manage system users and their permissions"
          actions={
            <button
              onClick={() => router.push('/users/new')}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg font-medium hover:from-sky-500 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add User
            </button>
          }
        />

        <div className="px-4 sm:px-6 lg:px-8 py-8">

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

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-11 pr-10 py-3 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                showFilters 
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" 
                  : "bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-700"
              )}
            >
              Roles {roleFilter.length > 0 && <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-md">{roleFilter.length}</span>}
            </button>

            {/* Clear Filters */}
            {(searchQuery || roleFilter.length > 0) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white text-sm font-medium transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 mb-6 shadow-sm">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filter by Role</h3>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => toggleRoleFilter(role)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      roleFilter.includes(role)
                        ? role === 'Site Admin'
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          : role === 'Admin'
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-600"
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Users Grid */}
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800">
              <Users className="w-12 h-12 text-gray-400 dark:text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
              <p className="text-gray-500 dark:text-zinc-400 text-sm">
                {users.length === 0 
                  ? "Get started by adding your first user."
                  : "Try adjusting your search or filters."}
              </p>
              {users.length === 0 && (
                <button
                  onClick={() => router.push('/users/new')}
                  className="mt-6 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium hover:from-sky-500 hover:to-blue-500 transition-all text-sm"
                >
                  Add User
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id}
                  onClick={() => handleEdit(user)}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700 cursor-pointer transition-all group hover:shadow-md dark:hover:bg-zinc-900"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-sky-500/10 dark:from-blue-500/20 dark:to-sky-500/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.email.split('@')[0]}
                        </h3>
                        <div className="flex gap-1 mt-1">
                          {user.roles.map((role) => (
                            <span 
                              key={role}
                              className={cn(
                                "px-2 py-0.5 text-xs font-medium rounded-md",
                                role === 'Admin' 
                                  ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30" 
                                  : role === 'Site Admin'
                                  ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                                  : "bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-transparent"
                              )}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImpersonate(user);
                          }}
                          className="p-2 text-gray-400 dark:text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Impersonate User"
                        >
                          <VenetianMask className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserToDelete(user);
                          }}
                        className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-zinc-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                    <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500">
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    <span className="capitalize">{user.theme} theme</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {userToDelete && (
          <DeleteModal
            user={userToDelete}
            onConfirm={() => handleDelete(userToDelete)}
            onCancel={() => setUserToDelete(null)}
          />
        )}
      </div>
    </Layout>
  );
}