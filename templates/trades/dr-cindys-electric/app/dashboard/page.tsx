'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import {
  History,
  Folder,
  Zap,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api';

interface DashboardStats {
  templates: number;
  proposals: number;
  users: number;
  companies: number;
  pendingUsers?: number;
  notifications?: number;
  projects?: number;
  activeGenerations?: number;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    templates: 0,
    proposals: 0,
    users: 0,
    companies: 0,
    projects: 0,
    activeGenerations: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // No token - redirect to login
      router.push('/login');
      return;
    }
    
    setIsAuthenticated(true);
    const apiUrl = getApiUrl();
    
    // Fetch user profile to check admin status
    fetch(`${apiUrl}/api/v1/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) {
          // Token is invalid - clear it and redirect to login (silently)
          localStorage.removeItem('token');
          router.push('/login');
          return null; // Return null instead of throwing
        }
        return res.json();
      })
      .then(data => {
        if (!data) {
          setIsLoading(false);
          return; // Exit if we got null from failed auth
        }
        const userData = data.data || data;
        const isAdminUser = userData.roles?.includes('Site Admin');
        setIsAdmin(isAdminUser);

        // Fetch dashboard stats
        fetch(`${apiUrl}/api/v1/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(statsData => {
            if (statsData) {
              const stats = statsData.data || statsData;
              setStats(prev => ({ ...prev, ...stats }));
            }
          })
          .catch(() => { /* Stats fetch failed - ignore */ });

        // Fetch projects to update project count
        fetch(`${apiUrl}/api/v1/projects?limit=1`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(projectData => {
            if (projectData) {
              const projectList = projectData.data?.data || projectData.data || [];
              setStats(prev => ({ ...prev, projects: projectData.data?.total || projectList.length }));
            }
          })
          .catch(() => { /* Projects fetch failed - ignore */ })
          .finally(() => setIsLoading(false));
      })
      .catch(() => {
        // Silently handle any errors - just stop loading
        setIsLoading(false);
      });
  }, [router]);

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
        <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-zinc-950">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
      <SubHeader 
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle="Overview of your workspace and recent activity"
      />

      <div className="p-6 md:p-8 bg-gray-50 dark:bg-zinc-950 min-h-screen text-gray-900 dark:text-zinc-100">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer" onClick={() => router.push('/projects')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Folder className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">+12%</span>
              </div>
              <h3 className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Total Projects</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.projects || 0}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer" onClick={() => router.push('/projects')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-500 dark:text-zinc-500">Active</span>
              </div>
              <h3 className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Active Generations</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeGenerations || 0}</p>
            </div>

            {isAdmin && (
              <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer" onClick={() => router.push('/users')}>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-gray-500 dark:text-zinc-500 text-xs">Manage</span>
                </div>
                <h3 className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.users}</p>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer" onClick={() => router.push('/activity')}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-lg">
                  <History className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-pink-600 dark:text-pink-400 bg-pink-500/10 px-2 py-1 rounded-full">7 Days</span>
              </div>
              <h3 className="text-gray-500 dark:text-zinc-500 text-sm font-medium">Recent Activity</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.notifications || 0}</p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}