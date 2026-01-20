'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { Building2, Search, X, Trash2, Plus, MapPin, Mail, Phone, ChevronRight } from 'lucide-react';
import { cn, formatPhone } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { logActivity } from '@/lib/activity';
import { get, getApiUrl } from '@/lib/api';

interface Company {
  id: number;
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
  createdAt: string;
}

type SortField = 'name' | 'city' | 'state';
type SortDirection = 'asc' | 'desc';

interface DeleteModalProps {
  company: Company;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteModal({ company, onConfirm, onCancel }: DeleteModalProps) {
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
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">Delete Company</h3>
        <p className="text-gray-500 dark:text-zinc-400 mb-6 text-center text-sm">
          Are you sure you want to delete <span className="text-gray-900 dark:text-white font-medium">{company.name}</span>? 
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
            Delete Company
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<number | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Add search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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
          const hasSiteAdminRole = data.roles?.includes('Site Admin');
          const hasAdminRole = data.roles?.includes('Admin');
          setIsSiteAdmin(hasSiteAdminRole);
          setIsAdmin(hasAdminRole);
          setUserCompanyId(data.companyId);
          
          if (!hasSiteAdminRole && !hasAdminRole) {
            router.push('/404');
            return;
          }

          return { token, hasSiteAdminRole, hasAdminRole, companyId: data.companyId };
        })
        .then(userData => {
          if (!userData) return;
          
          if (userData.hasAdminRole && !userData.hasSiteAdminRole) {
            if (!userData.companyId) {
              const apiUrl = getApiUrl();
              return fetch(`${apiUrl}/api/v1/companies`, {
                headers: {
                  'Authorization': `Bearer ${userData.token}`
                }
              })
              .then(res => {
                if (!res.ok) throw new Error('Failed to fetch companies');
                return res.json();
              })
              .then(payload => {
                const allCompanies = payload.data || payload;
                if (allCompanies && allCompanies.length > 0) {
                  return { singleCompany: true, data: [allCompanies[0]] };
                } else {
                  return { singleCompany: true, data: [] };
                }
              });
            }
            
            const apiUrl = getApiUrl();
            return fetch(`${apiUrl}/api/v1/companies/${userData.companyId}`, {
              headers: {
                'Authorization': `Bearer ${userData.token}`
              }
            })
            .then(res => {
              if (!res.ok) {
                return { singleCompany: true, data: [] };
              }
              return res.json().then(payload => {
                const companyData = payload.data || payload;
                const company = companyData.company || companyData; 
                return { singleCompany: true, data: [company] };
              });
            })
            .catch(err => {
              return { singleCompany: true, data: [] };
            });
          } else {
            const apiUrl = getApiUrl();
            return fetch(`${apiUrl}/api/v1/companies`, {
              headers: {
                'Authorization': `Bearer ${userData.token}`
              }
            })
            .then(res => {
              if (!res.ok) throw new Error('Failed to fetch companies');
              return res.json().then(payload => {
                const data = payload.data || payload;
                return { singleCompany: false, data };
              });
            });
          }
        })
        .then(result => {
          if (!result) return;
          setCompanies(result.data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          toast({
            title: "Error",
            description: "Failed to load companies. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
        });
    }
  }, [toast, router]);

  const handleEdit = (company: Company) => {
    router.push(`/companies/${company.id}`);
  };

  const handleDelete = async (company: Company) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/v1/companies/${company.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete company');

      await logActivity({
        type: 'company',
        action: 'deleted',
        title: `Company "${company.name}"`,
        entityId: company.id
      });

      setCompanies(companies.filter(c => c.id !== company.id));
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete company. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCompanyToDelete(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get unique states for filtering
  const availableStates = useMemo(() => {
    const states = companies.map(company => company.state).filter(Boolean);
    return Array.from(new Set(states)).sort();
  }, [companies]);
  
  // Toggle state filter
  const toggleStateFilter = (state: string) => {
    setStateFilter(prev => 
      prev.includes(state)
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStateFilter([]);
  };

  // Filter and sort companies
  const filteredAndSortedCompanies = [...companies]
    .filter(company => {
      if (stateFilter.length > 0 && !stateFilter.includes(company.state)) {
        return false;
      }
      
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (
          company.name.toLowerCase().includes(searchLower) ||
          company.addressLine1.toLowerCase().includes(searchLower) ||
          company.city.toLowerCase().includes(searchLower) ||
          company.state.toLowerCase().includes(searchLower) ||
          company.zip.toLowerCase().includes(searchLower) ||
          company.email.toLowerCase().includes(searchLower) ||
          company.phone.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return a.name.localeCompare(b.name) * direction;
        case 'city':
          return a.city.localeCompare(b.city) * direction;
        case 'state':
          return a.state.localeCompare(b.state) * direction;
        default:
          return 0;
      }
    });

  if (!isSiteAdmin && !isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isSiteAdmin || isAdmin} noPadding>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isSiteAdmin || isAdmin} noPadding>
      <SubHeader 
        icon={Building2}
        title={`Companies (${filteredAndSortedCompanies.length})`}
        subtitle="Manage company accounts and their settings"
        actions={
          isSiteAdmin && (
            <button
              onClick={() => router.push('/companies/new')}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg font-medium hover:from-sky-500 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          )
        }
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies..."
              className="w-full pl-11 pr-10 py-3 bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-white transition-colors"

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
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30" 
                : "bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-700"
            )}
          >
            Filters {stateFilter.length > 0 && <span className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-md">{stateFilter.length}</span>}
          </button>

          {/* Clear Filters */}
          {(searchQuery || stateFilter.length > 0) && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="p-4 bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filter by State</h3>
            <div className="flex flex-wrap gap-2">
              {availableStates.map(state => (
                <button
                  key={state}
                  onClick={() => toggleStateFilter(state)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    stateFilter.includes(state)
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30"
                      : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-zinc-600"
                  )}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Companies Grid */}
        {filteredAndSortedCompanies.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800">
            <Building2 className="w-12 h-12 text-gray-400 dark:text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No companies found</h3>
            <p className="text-gray-500 dark:text-zinc-400 text-sm">
              {companies.length === 0 
                ? "Get started by adding your first company."
                : "Try adjusting your search or filters."}
            </p>
            {companies.length === 0 && isSiteAdmin && (
              <button
                onClick={() => router.push('/companies/new')}
                className="mt-6 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium hover:from-sky-500 hover:to-blue-500 transition-all text-sm"
              >
                Add Company
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedCompanies.map((company, index) => (
              <div key={company.id ?? `company-${index}`} onClick={() => handleEdit(company)} className="p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 cursor-pointer transition-all group hover:bg-gray-50 dark:hover:bg-zinc-900">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-sky-500/10 dark:from-blue-500/20 dark:to-sky-500/20 border border-blue-500/20 dark:border-blue-500/30 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{company.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-500">{company.city}, {company.state}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isSiteAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompanyToDelete(company);
                        }}
                        className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Delete company"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-zinc-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                    <span className="truncate">{company.addressLine1}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                    <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                    <span className="truncate">{company.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
                    <Phone className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                    <span>{formatPhone(company.phone)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {companyToDelete && (
        <DeleteModal
          company={companyToDelete}
          onConfirm={() => handleDelete(companyToDelete)}
          onCancel={() => setCompanyToDelete(null)}
        />
      )}
    </Layout>
  );
}