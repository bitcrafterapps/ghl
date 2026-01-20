'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import {
  Building2,
  Users,
  Image as ImageIcon,
  Star,
  Settings,
  Activity,
  Mail,
  FileText,
  Newspaper,
  List,
  Shield,
  ArrowRight
} from 'lucide-react';

const ADMIN_LINKS = [
  { 
    name: 'Site Settings', 
    href: '/site-settings', 
    icon: Settings, 
    description: 'Global system configuration',
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    iconBg: 'bg-gray-500/20'
  },
  { 
    name: 'Site Status', 
    href: '/site-status', 
    icon: Activity, 
    description: 'Monitor system health and status',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    iconBg: 'bg-emerald-500/20'
  },
  { 
    name: 'Email Templates', 
    href: '/email-templates', 
    icon: Mail, 
    description: 'Manage email notification templates',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    iconBg: 'bg-indigo-500/20'
  },
  { 
    name: 'Email Logs', 
    href: '/email-logs', 
    icon: FileText, 
    description: 'View delivery logs',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    iconBg: 'bg-purple-500/20'
  },
  { 
    name: 'Release Notes', 
    href: '/release-notes', 
    icon: Newspaper, 
    description: 'Manage system release notes',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    iconBg: 'bg-orange-500/20'
  },
  { 
    name: 'Log Viewer', 
    href: '/log-viewer', 
    icon: List, 
    description: 'View system logs',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    iconBg: 'bg-red-500/20'
  }
];

export default function SystemAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Basic client-side check similar to Dashboard
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Check if user has admin role (optional extra check, backend enforces real security)
    // For now we assume sidebar logic allowed them here, so we show the page.
    // In a real app we'd decode token or fetch user profile.
    setIsAuthenticated(true);
    setIsAdmin(true); // Assuming access
    setIsLoading(false);

  }, [router]);

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
        <div className="flex items-center justify-center h-full bg-[#0a0a0f]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
      <div className="bg-gray-50 dark:bg-[#0a0a0f] min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
        <SubHeader 
          icon={Shield}
          title="System Admin"
          subtitle="System Administration & Configuration"
        />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADMIN_LINKS.map((link) => (
              <div 
                key={link.name}
                onClick={() => router.push(link.href)}
                className="bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/10 p-5 rounded-xl hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer group hover:bg-gray-50 dark:hover:bg-[#252525] shadow-sm dark:shadow-none"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${link.iconBg} ${link.color}`}>
                    <link.icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white transition-colors" />
                </div>
                
                <h3 className="text-gray-900 dark:text-white font-medium mt-4 text-lg">{link.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{link.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
