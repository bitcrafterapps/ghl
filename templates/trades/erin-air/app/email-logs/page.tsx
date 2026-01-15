'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { DataTable, Column } from '@/components/ui/data-table/DataTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  List
} from 'lucide-react';
import { getAuthToken } from '@/lib/auth';
import { getApiUrl } from '@/lib/api';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface EmailLog {
  id: number;
  templateKey: string | null;
  recipientEmail: string;
  recipientUserId: number | null;
  subject: string;
  status: 'pending' | 'sent' | 'failed';
  resendId: string | null;
  error: string | null;
  createdAt: string;
}

export default function EmailLogsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { userProfile, isProfileLoaded } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Auth check
  useEffect(() => {
    if (isProfileLoaded) {
      if (!userProfile) {
        router.push('/login');
        return;
      }
      
      const adminParams = userProfile.roles?.includes('Site Admin') || userProfile.roles?.includes('Admin');
      setIsAdmin(adminParams);
      
      if (!adminParams) {
          toast({ title: 'Access Denied', description: 'You must be a Site Admin or Admin to view this page', variant: 'destructive' });
          router.push('/dashboard');
      }
    }
  }, [isProfileLoaded, userProfile]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const apiUrl = getApiUrl();
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (status) params.append('status', status);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await fetch(`${apiUrl}/api/v1/emails/logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setLogs(data.data.logs);
        setTotal(data.data.pagination.total);
      } else {
        toast({
          title: 'Error',
          description: data.error?.message || 'Failed to fetch email logs',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch email logs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [page, limit, status, debouncedSearch, isAdmin]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const columns: Column<EmailLog>[] = [
    {
       key: 'recipientEmail',
       header: 'Recipient',
       cell: (log) => (
         <div>
           <div className="font-medium text-gray-900 dark:text-white">{log.recipientEmail}</div>
           {log.recipientUserId && (
             <div className="text-xs text-gray-500">User ID: {log.recipientUserId}</div>
           )}
         </div>
       )
    },
    {
      key: 'subject',
      header: 'Subject',
      cell: (log) => (
        <div className="max-w-xs truncate" title={log.subject}>
          {log.subject}
          {log.templateKey && (
            <div className="text-xs text-gray-400 mt-0.5">Template: {log.templateKey}</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      cell: (log) => {
        let colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        let Icon = Clock;
        
        if (log.status === 'sent') {
          colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
          Icon = CheckCircle;
        } else if (log.status === 'failed') {
          colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
          Icon = AlertCircle;
        }

        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            <Icon className="w-3 h-3" />
            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
          </span>
        );
      },
      sortable: true,
      sortKey: 'status'
    },
    {
      key: 'createdAt',
      header: 'Date',
      cell: (log) => format(new Date(log.createdAt), 'MMM d, yyyy HH:mm'),
      sortKey: 'createdAt',
      sortable: true
    },
    {
      key: 'error',
      header: 'Error',
      cell: (log) => log.error ? (
        <div className="text-red-500 text-xs truncate max-w-xs" title={log.error}>
          {log.error}
        </div>
      ) : null
    }
  ];

  if (!isProfileLoaded) {
    return null; 
  }

  // Allow rendering if not authenticated yet (redirect handled in effect)
  if (!userProfile && isLoading) return null;

  return (
    <Layout isAuthenticated={!!userProfile} isAdmin={isAdmin} noPadding>
      <SubHeader 
        icon={List}
        title="Email Logs" 
        actions={
          <div className="flex gap-2">
            <Button onClick={fetchLogs} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        }
      />
      
      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <div className="relative w-full sm:w-64">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
               <input
                 type="text"
                 placeholder="Search by email..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-[#3A3A3A] rounded-md bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
               />
             </div>
             
             <div className="relative">
               <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
               <select
                 value={status}
                 onChange={handleStatusChange}
                 className="pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-[#3A3A3A] rounded-md bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer"
               >
                 <option value="">All Statuses</option>
                 <option value="sent">Sent</option>
                 <option value="failed">Failed</option>
                 <option value="pending">Pending</option>
               </select>
             </div>
          </div>
        </div>

        <DataTable
          data={logs}
          columns={columns}
          keyField="id"
          noDataMessage="No email logs found"
          
          // Expanded detail view
          expandedContent={(log) => (
            <div className="bg-gray-50 dark:bg-[#1C1C1C] p-4 rounded-md border border-gray-200 dark:border-[#3A3A3A] grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                   <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</span>
                   <div className="text-gray-900 dark:text-gray-100 font-medium">{log.subject}</div>
                </div>
                <div>
                   <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Template Key</span>
                   <div className="text-gray-700 dark:text-gray-300 font-mono">{log.templateKey || 'N/A'}</div>
                </div>
                <div>
                   <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recipient Info</span>
                   <div className="text-gray-700 dark:text-gray-300">
                       {log.recipientEmail}
                       {log.recipientUserId && <span className="text-gray-500 ml-2">(User ID: {log.recipientUserId})</span>}
                   </div>
                </div>
                <div>
                   <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Resend ID</span>
                   <div className="text-gray-700 dark:text-gray-300 font-mono text-xs">{log.resendId || 'N/A'}</div>
                </div>
                {log.error && (
                    <div className="col-span-1 md:col-span-2">
                        <span className="block text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Error Details</span>
                        <div className="text-red-600 bg-red-50 dark:bg-red-900/10 p-2 rounded border border-red-200 dark:border-red-800/30 font-mono text-xs whitespace-pre-wrap">
                            {log.error}
                        </div>
                    </div>
                )}
            </div>
          )}
          isExpandable={() => true}

          // External pagination
          externalCurrentPage={page}
          externalItemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </div>
    </Layout>
  );
}
