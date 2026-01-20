'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { TokenUsageDetails } from '@/components/TokenUsageDetails';
import { BarChart3, TrendingUp, Users, ChevronRight, Eye, List, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getApiUrl } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface UsageByModel {
  model: string;
  provider: string;
  totalInput: number;
  totalOutput: number;
  total: number;
  requestCount: number;
  estimatedCost?: number;
}

interface TopUser {
  userId: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  totalInput?: number;
  totalOutput?: number;
  totalUsage: number;
  requestCount: number;
}

interface GlobalUsageStats {
  usageByModel: UsageByModel[];
  topUsers: TopUser[];
  grandTotal: number;
  totalCost?: number;
}

interface UserUsageStats {
  summary: UsageByModel[];
  totals: {
    input: number;
    output: number;
    total: number;
    requests: number;
    cost: number;
  };
}

type UserRole = 'Site Admin' | 'Admin' | 'User';

export default function TokenUsagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<GlobalUsageStats | null>(null);
  const [userStats, setUserStats] = useState<UserUsageStats | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('User');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsFilters, setDetailsFilters] = useState<{ model?: string; userId?: number; userEmail?: string }>({});
  const [modelViewMode, setModelViewMode] = useState<'list' | 'graph'>('list');

  // Chart colors
  const COLORS = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

  // Determine if user can see global/company stats (Site Admin or Admin)
  const isAdminOrSiteAdmin = userRole === 'Site Admin' || userRole === 'Admin';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const apiUrl = getApiUrl();

    if (!token) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(true);

    // Fetch user profile to determine role
    fetch(`${apiUrl}/api/v1/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(async (user) => {
      // Determine user role
      let role: UserRole = 'User';
      if (user.roles?.includes('Site Admin')) {
        role = 'Site Admin';
      } else if (user.roles?.includes('Admin')) {
        role = 'Admin';
      }
      setUserRole(role);

      // Fetch appropriate stats based on role
      if (role === 'Site Admin' || role === 'Admin') {
        // Fetch global/company stats
        const response = await fetch(`${apiUrl}/api/v1/usage/global`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setGlobalStats(data);
        }
      } else {
        // Fetch user's own stats
        const response = await fetch(`${apiUrl}/api/v1/usage/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUserStats(data);
        }
      }
    })
    .catch(err => {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to load usage statistics",
        variant: "destructive"
      });
    })
    .finally(() => setLoading(false));
  }, [router, toast]);

  if (loading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isAdminOrSiteAdmin} noPadding>
        <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-zinc-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </Layout>
    );
  }

  // Get the data based on role
  const usageByModel = isAdminOrSiteAdmin
    ? (globalStats?.usageByModel || [])
    : (userStats?.summary || []);

  const grandTotal = isAdminOrSiteAdmin
    ? (globalStats?.grandTotal || 0)
    : (userStats?.totals?.total || 0);

  const totalCost = isAdminOrSiteAdmin
    ? (globalStats?.totalCost || 0)
    : (userStats?.totals?.cost || 0);

  const topUsers = globalStats?.topUsers || [];

  // Subtitle based on role
  const getSubtitle = () => {
    switch (userRole) {
      case 'Site Admin':
        return 'Global usage tracking across all models and users';
      case 'Admin':
        return 'Company usage tracking across all models and team members';
      default:
        return 'Your personal token usage across all models';
    }
  };

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isAdminOrSiteAdmin} noPadding>
      <SubHeader
        icon={BarChart3}
        title="Token Usage"
        subtitle={getSubtitle()}
        actions={null}
      />

      <div className="p-6 md:p-8 bg-gray-50 dark:bg-zinc-950 min-h-screen text-gray-900 dark:text-zinc-100">
        <div className="w-[90%] mx-auto space-y-8">
          {/* Summary Cards */}
          <div className={cn(
            "grid gap-6",
            isAdminOrSiteAdmin ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2"
          )}>
            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-6 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-zinc-500">Total Tokens Consumed</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{grandTotal.toLocaleString()}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-6 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-zinc-500">Total Estimated Cost</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${totalCost.toFixed(2)}</h3>
                </div>
              </div>
            </div>

            {/* View Details Card - only for admin roles */}
            {isAdminOrSiteAdmin && (
              <button
                onClick={() => { setDetailsFilters({}); setDetailsOpen(true); }}
                className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:border-blue-500/50 transition-all group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-zinc-500">Drill Down</p>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">View Details</h3>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-zinc-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </button>
            )}
          </div>

          <div className={cn(
            "grid gap-8",
            isAdminOrSiteAdmin ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          )}>
            {/* Usage by Model */}
            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usage by Model</h3>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
                  <button
                    onClick={() => setModelViewMode('list')}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      modelViewMode === 'list' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
                    )}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setModelViewMode('graph')}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      modelViewMode === 'graph' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
                    )}
                    title="Graph View"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {modelViewMode === 'list' ? (
                  <div className="space-y-4">
                    {usageByModel.map((item) => (
                      <button
                        key={item.model}
                        onClick={() => {
                          if (isAdminOrSiteAdmin) {
                            setDetailsFilters({ model: item.model });
                            setDetailsOpen(true);
                          }
                        }}
                        className={cn(
                          "w-full space-y-2 p-3 -m-3 rounded-lg transition-colors text-left group",
                          isAdminOrSiteAdmin && "hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer"
                        )}
                        disabled={!isAdminOrSiteAdmin}
                      >
                        <div className="flex justify-between text-sm">
                          <span className={cn(
                            "font-medium text-gray-900 dark:text-white flex items-center gap-2",
                            isAdminOrSiteAdmin && "group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors"
                          )}>
                            {item.model}
                            {isAdminOrSiteAdmin && (
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400" />
                            )}
                          </span>
                          <div className="text-right">
                            <span className="text-gray-500 dark:text-zinc-400 block">{item.total.toLocaleString()} tokens</span>
                            {item.estimatedCost !== undefined && (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">${item.estimatedCost.toFixed(4)}</span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                          <div
                            className={cn(
                              "bg-blue-500 h-2 rounded-full",
                              isAdminOrSiteAdmin && "group-hover:bg-blue-600 dark:group-hover:bg-blue-400 transition-colors"
                            )}
                            style={{ width: `${Math.min((item.total / (grandTotal || 1)) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-500">
                          <span className="flex gap-3">
                            <span>{item.provider}</span>
                            <span>•</span>
                            <span>In: {item.totalInput.toLocaleString()}</span>
                            <span>•</span>
                            <span>Out: {item.totalOutput.toLocaleString()}</span>
                          </span>
                          <span>{item.requestCount} requests</span>
                        </div>
                      </button>
                    ))}
                    {usageByModel.length === 0 && (
                      <div className="text-center text-gray-500 dark:text-zinc-500 py-4">No usage data yet</div>
                    )}
                  </div>
                ) : (
                  <div className="h-[400px] w-full">
                    {usageByModel.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-zinc-500">
                        No usage data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={usageByModel}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-800" horizontal={false} />
                          <XAxis type="number" stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                          <YAxis
                            type="category"
                            dataKey="model"
                            stroke="#9ca3af"
                            fontSize={12}
                            width={100}
                            tickFormatter={(value) => value.replace('models/', '').substring(0, 15)}
                          />
                          <Tooltip
                            cursor={{ fill: 'var(--tooltip-cursor)', opacity: 0.4 }}
                            contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderColor: 'var(--tooltip-border)', color: 'var(--tooltip-text)' }}
                            itemStyle={{ color: 'var(--tooltip-text)' }}
                            formatter={(value: number | undefined) => [value?.toLocaleString() || '0', 'Tokens']}
                          />
                          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                            {usageByModel.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Top Users - only for admin roles */}
            {isAdminOrSiteAdmin && (
              <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userRole === 'Site Admin' ? 'Top Users' : 'Team Members'}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-zinc-500">Click to view details</span>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {topUsers.map((user) => (
                    <button
                      key={user.userId}
                      onClick={() => { setDetailsFilters({ userId: user.userId, userEmail: user.email }); setDetailsOpen(true); }}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-zinc-700 transition-colors">
                          <Users className="w-4 h-4 text-gray-400 dark:text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors flex items-center gap-2">
                            {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400" />
                          </p>
                          <p className="text-xs text-gray-500 dark:text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{user.totalUsage.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-500">{user.requestCount} requests</p>
                      </div>
                    </button>
                  ))}
                  {topUsers.length === 0 && (
                    <div className="p-6 text-center text-gray-500 dark:text-zinc-500">
                      No usage data recorded yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Token Usage Details Modal */}
      <TokenUsageDetails
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        isAdmin={isAdminOrSiteAdmin}
        initialFilters={detailsFilters}
      />
    </Layout>
  );
}
