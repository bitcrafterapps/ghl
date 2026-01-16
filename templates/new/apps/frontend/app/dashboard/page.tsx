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
  AlertCircle
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
    notifications: 0
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
        if (response?.data) {
          setStats(prev => ({ ...prev, ...response.data }));
        }
      })
      .catch((err) => console.error('Failed to fetch stats:', err))
      .finally(() => setIsLoading(false));

  }, [router]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const pieData = stats.jobStatusDistribution.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
    value: item.count
  }));

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} noPadding>
        <div className="flex items-center justify-center h-full bg-[#0a0a0f]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} noPadding>
      <div className="bg-[#0a0a0f] min-h-screen text-white">
        <SubHeader 
          icon={Activity}
          title="Dashboard"
          subtitle="Business Overview & Performance"
        />

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          
          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <div className="bg-[#1C1C1C] border border-white/10 p-6 rounded-xl hover:border-teal-500/50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-teal-500/20 text-teal-400 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">Paid</span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Total Revenue</h3>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(stats.totalRevenue)}</p>
            </div>

            {/* Active Jobs */}
            <div className="bg-[#1C1C1C] border border-white/10 p-6 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer" onClick={() => router.push('/jobs')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">{stats.activeJobs} Active</span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Active Jobs</h3>
              <p className="text-2xl font-bold text-white mt-1">{stats.activeJobs}</p>
            </div>

            {/* Pending Quotes */}
            <div className="bg-[#1C1C1C] border border-white/10 p-6 rounded-xl hover:border-orange-500/50 transition-colors cursor-pointer" onClick={() => router.push('/jobs?status=quote')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 text-orange-400 rounded-lg">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">Needs Action</span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Pending Jobs</h3>
              <p className="text-2xl font-bold text-white mt-1">{stats.pendingJobs}</p>
            </div>

            {/* Active Contracts */}
            <div className="bg-[#1C1C1C] border border-white/10 p-6 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer" onClick={() => router.push('/service-contracts')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">MRR {formatCurrency(stats.contractRevenue)}</span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Active Contracts</h3>
              <p className="text-2xl font-bold text-white mt-1">{stats.activeContracts}</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Job Distribution Chart */}
            <div className="bg-[#1C1C1C] border border-white/10 p-6 rounded-xl">
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-gray-400" />
                Job Status Distribution
              </h3>
              <div className="h-[300px] w-full">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#333' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No job data available
                  </div>
                )}
              </div>
            </div>

            {/* Activity / Performance Chart (Placeholder using Job Counts) */}
            <div className="bg-[#1C1C1C] border border-white/10 p-6 rounded-xl">
              <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <BarChart className="w-4 h-4 text-gray-400" />
                Job Performance
              </h3>
              <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Completed', value: stats.completedJobs },
                        { name: 'Active', value: stats.activeJobs },
                        { name: 'Pending', value: stats.pendingJobs },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#0a0a0f', borderColor: '#333' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
                      />
                      <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={50} />
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