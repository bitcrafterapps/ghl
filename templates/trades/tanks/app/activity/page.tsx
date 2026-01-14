'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { History, FileText, Files, Building2, Users, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/lib/api';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ActivityItem {
  id: string;
  type: 'proposal' | 'template' | 'company' | 'user';
  action: 'created' | 'updated' | 'deleted';
  title: string;
  timestamp: string;
  userId: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ActivityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    type: '',
    action: '',
    search: ''
  });
  const [userProfile, setUserProfile] = useState<{ id: string, name?: string, roles?: string[] } | null>(null);
  const apiUrl = getApiUrl();
  const fetchActivities = async (token: string, userId: string) => {
    try {
      const queryParams = new URLSearchParams({
        page: pagination?.page.toString(),
        limit: pagination?.limit.toString(),
        userId: userId,
        ...(filters.type && filters.type !== 'all' && { type: filters.type }),
        ...(filters.action && filters.action !== 'all' && { action: filters.action }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`${apiUrl}/api/v1/dashboard/recent-changes?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      setActivities(data.activities);
      setPagination({
        page: data.page || 1,
        limit: data.limit || 50,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.limit || 50))
      });
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load your activity logs. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const apiUrl = getApiUrl();
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
          const isAdminUser = data.roles?.includes('Site Admin');
          setIsAdmin(isAdminUser);
          setUserProfile(data);
          
          if (data.id) {
            return fetchActivities(token, data.id);
          }
        })
        .catch(error => {
          console.error('Error:', error);
          toast({
            title: "Error",
            description: "Failed to load user profile. Please try again.",
            variant: "destructive"
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && userProfile?.id) {
      fetchActivities(token, userProfile.id);
    }
  }, [pagination?.page, filters, userProfile?.id]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'proposal':
        return <FileText className="h-5 w-5" />;
      case 'template':
        return <Files className="h-5 w-5" />;
      case 'company':
        return <Building2 className="h-5 w-5" />;
      case 'user':
        return <Users className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'text-green-400';
      case 'updated':
        return 'text-blue-400';
      case 'deleted':
        return 'text-red-400';
      default:
        return 'text-[#A1A1A1]';
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleTypeFilter = (value: string) => {
    setFilters(prev => ({ ...prev, type: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleActionFilter = (value: string) => {
    setFilters(prev => ({ ...prev, action: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: string) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: parseInt(newLimit), 
      page: 1 // Reset to first page when limit changes
    }));
  };

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#205ab2]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
      <SubHeader 
        icon={History}
        title="My Activity"
        subtitle="View your recent actions and changes"
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#A1A1A1]" />
              <Input
                placeholder="Search activities..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-[#2A2A2A] border-[#3A3A3A]"
              />
            </div>
            <Select value={filters.type} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-[180px] bg-[#2A2A2A] border-[#3A3A3A]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="proposal">Proposals</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
                <SelectItem value="company">Companies</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.action} onValueChange={handleActionFilter}>
              <SelectTrigger className="w-[180px] bg-[#2A2A2A] border-[#3A3A3A]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Activity List */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#2A2A2A] rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-[#3A3A3A] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">My Recent Activities</h2>
              <span className="text-sm text-[#A1A1A1]">
                Showing {Math.min(((pagination?.page || 1) - 1) * (pagination?.limit || 50) + 1, pagination?.total || 0)}-{Math.min((pagination?.page || 1) * (pagination?.limit || 50), pagination?.total || 0)} of {pagination?.total || 0} activities
              </span>
            </div>
            <div className="divide-y divide-[#3A3A3A]">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="px-6 py-4 hover:bg-[#3A3A3A] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`${getActivityColor(activity.action)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          <span className={`font-medium ${getActivityColor(activity.action)}`}>
                            {activity.action.charAt(0).toUpperCase() + activity.action.slice(1)}
                          </span>{' '}
                          {activity.title}
                        </p>
                        <p className="text-[#A1A1A1] text-xs">
                          {format(new Date(activity.timestamp), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-[#A1A1A1]">No activity logs found for your account</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination?.total > 0 && (
              <div className="px-6 py-4 border-t border-[#3A3A3A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#A1A1A1]">Rows per page:</span>
                  <Select 
                    value={pagination.limit?.toString() || "10"} 
                    onValueChange={handleLimitChange}
                  >
                    <SelectTrigger className="w-[70px] h-8 bg-[#2A2A2A] border-[#3A3A3A]">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[#A1A1A1] text-sm hidden sm:inline-block">
                    Page {pagination.page} of {pagination.totalPages || 1}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="bg-[#2A2A2A] border-[#3A3A3A] hover:bg-[#3A3A3A]"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= (pagination.totalPages || 1)}
                      className="bg-[#2A2A2A] border-[#3A3A3A] hover:bg-[#3A3A3A]"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 