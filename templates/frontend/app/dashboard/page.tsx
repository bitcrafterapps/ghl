'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import {
  Briefcase,
  FileText,
  DollarSign,
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Image as ImageIcon,
  Users
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

interface DashboardStats {
  activeJobs: number;
  pendingJobs: number;
  completedJobs: number;
  totalRevenue: number;
  activeContracts: number;
  contractRevenue: number;
  jobStatusDistribution: { status: string; count: number }[];
  notifications: number;
  totalReviews?: number;
  galleryItems?: number;
  users?: number;
}

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6'];

export default function DashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    totalRevenue: 0,
    activeContracts: 0,
    contractRevenue: 0,
    jobStatusDistribution: [],
    notifications: 0,
    totalReviews: 0,
    galleryItems: 0,
    users: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    setIsAuthenticated(true);
    const apiUrl = getApiUrl();
    
    // Fetch dashboard stats
    fetch(`${apiUrl}/api/v1/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(response => {
        if (response) {
          // Handle both wrapped { data: ... } and unwrapped responses
          const statsData = response.data || response;
          setStats(prev => ({ ...prev, ...statsData }));
        }
      })
      .catch((err) => console.error('Failed to fetch stats:', err))
      .finally(() => setIsLoading(false));

  }, [router]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const pieData = stats.jobStatusDistribution.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
    value: item.count
  }));

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} noPadding>
        <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-[#0a0a0f]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} noPadding>
      <div className="bg-gray-50 dark:bg-[#0a0a0f] min-h-screen text-gray-900 dark:text-white">
        <SubHeader 
          icon={Activity}
          title="Dashboard"
          subtitle="Business Overview"
        />

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          
          {/* Top Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            
            {/* Revenue */}
            <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-4 rounded-xl hover:border-teal-500/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">Paid</span>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium">Revenue</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{formatCurrency(stats.totalRevenue)}</p>
            </div>

            {/* Active Jobs */}
            <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-4 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => router.push('/jobs')}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full">{stats.activeJobs} Active</span>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium">Jobs</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.activeJobs}</p>
            </div>

            {/* Pending Jobs */}
            <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-4 rounded-xl hover:border-orange-500/50 transition-colors cursor-pointer" onClick={() => router.push('/jobs?status=quote')}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full">Action</span>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium">Pending</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.pendingJobs}</p>
            </div>

            {/* Active Contracts */}
            <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-4 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer" onClick={() => router.push('/service-contracts')}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-full">MRR</span>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium">Contracts</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.activeContracts}</p>
            </div>

            {/* Reviews */}
            <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-4 rounded-xl hover:border-yellow-500/50 transition-colors cursor-pointer" onClick={() => router.push('/reviews-management')}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-lg">
                  <Star className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded-full">Total</span>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium">Reviews</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.totalReviews || 0}</p>
            </div>

            {/* Gallery Items */}
            <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-4 rounded-xl hover:border-pink-500/50 transition-colors cursor-pointer" onClick={() => router.push('/gallery-management')}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-pink-500/20 text-pink-600 dark:text-pink-400 rounded-lg">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-pink-600 dark:text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded-full">Live</span>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium">Gallery</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.galleryItems || 0}</p>
            </div>

            {/* Users */}
            <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-4 rounded-xl hover:border-indigo-500/50 transition-colors cursor-pointer" onClick={() => router.push('/users')}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full">Active</span>
              </div>
              <h3 className="text-gray-500 dark:text-gray-400 text-xs font-medium">Users</h3>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{stats.users || 0}</p>
            </div>
            
            {/* Notifications (Bonus card replacing a gap or just to fill 8 slots logic if needed, but we have 7 slots now. Let's leave it 7.) */}
            
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Job Distribution Chart */}
            <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-4 rounded-xl">
              <h3 className="text-gray-900 dark:text-white text-sm font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-gray-400" />
                Job Status
              </h3>
              <div className="h-[250px] w-full">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1C1C1C', borderColor: '#333', color: '#fff', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500">
                    No job data available
                  </div>
                )}
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-4 rounded-xl">
              <h3 className="text-gray-900 dark:text-white text-sm font-semibold mb-4 flex items-center gap-2">
                <BarChart className="w-4 h-4 text-gray-400" />
                Performance
              </h3>
              <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Completed', value: stats.completedJobs },
                        { name: 'Active', value: stats.activeJobs },
                        { name: 'Pending', value: stats.pendingJobs },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#1C1C1C', borderColor: '#333', color: '#fff', fontSize: '12px' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                      />
                      <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}