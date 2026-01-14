'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { SubHeader } from '@/components/SubHeader';
import { FileText, ArrowUpDown, Search, X, Clock, AlertCircle, Info, CheckCircle, ChevronLeft, ChevronRight, FileSpreadsheet, File, FileCode, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast, toast } from '@/components/ui/use-toast';
import { format, subMonths } from 'date-fns';
import React from 'react';
import { DataTable } from '@/components/ui/data-table/DataTable';
import { getApiUrl } from '@/lib/api';  
interface LogEntry {
  id: number;
  timestamp: string;
  level: string;
  context: string;
  message: string;
  args?: any;
  metadata?: any;
}

// For UI display, we'll map the API response to this format
interface DisplayLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
  details?: string;
}

type SortField = 'timestamp' | 'level' | 'message' | 'source';
type SortDirection = 'asc' | 'desc';


export default function LogViewerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<DisplayLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Date range state
  const [startDate, setStartDate] = useState<string>(
    format(subMonths(new Date(), 1), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );

  // Add a new state for tracking export loading
  const [exportLoading, setExportLoading] = useState<'excel' | 'csv' | 'pipe' | null>(null);

  // Function to fetch logs from the API
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const apiUrl = getApiUrl();
      const response = await fetch(
        `${apiUrl}/api/v1/logs/range?startDate=${startDate}&endDate=${endDate}&page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching logs: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Map API response to our display format
      const mappedLogs: DisplayLogEntry[] = data.data.map((log: LogEntry) => ({
        id: log.id.toString(),
        timestamp: log.timestamp,
        level: mapLogLevel(log.level),
        message: log.message,
        source: log.context,
        details: log.args ? JSON.stringify(log.args, null, 2) : undefined
      }));

      setLogs(mappedLogs);
      setTotalItems(data.meta.pagination.total);
      setTotalPages(data.meta.pagination.pages);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load logs",
        variant: "destructive"
      });
      // Fallback to mock data in case of error
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to map API log levels to UI log levels
  const mapLogLevel = (level: string): 'info' | 'warning' | 'error' | 'debug' => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'error';
      case 'warn':
        return 'warning';
      case 'info':
        return 'info';
      case 'debug':
        return 'debug';
      default:
        return 'info';
    }
  };

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
          const isAdminUser = data.roles?.includes('Admin') || data.roles?.includes('Site Admin');
          setIsAdmin(isAdminUser);
          
          // Fetch logs after authentication is confirmed
          fetchLogs();
        })
        .catch(error => {
          console.error('Error:', error);
          toast({
            title: "Error",
            description: "Failed to load user profile. Please try again.",
            variant: "destructive"
          });
          setIsLoading(false);
        });
    } else {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [toast, router]);

  // Refetch logs when pagination, date range, or sorting changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [currentPage, itemsPerPage, startDate, endDate]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const toggleLevelFilter = (level: string) => {
    setLevelFilter(prev => 
      prev.includes(level) 
        ? prev.filter(r => r !== level) 
        : [...prev, level]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  const toggleSourceFilter = (source: string) => {
    setSourceFilter(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source) 
        : [...prev, source]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLevelFilter([]);
    setSourceFilter([]);
    setCurrentPage(1); // Reset to first page when filters are cleared
  };

  // Apply client-side filtering for search, level, and source filters
  const filteredLogs = logs
    .filter(log => {
      // Apply search query
      if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !log.source.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply level filter
      if (levelFilter.length > 0 && !levelFilter.includes(log.level)) {
        return false;
      }
      
      // Apply source filter
      if (sourceFilter.length > 0 && !sourceFilter.includes(log.source)) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortField === 'timestamp') {
        return sortDirection === 'asc' 
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      
      const aValue = a[sortField].toString().toLowerCase();
      const bValue = b[sortField].toString().toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

  // We'll use the filtered logs for display
  const displayLogs = filteredLogs;

  // Calculate pagination
  // We'll use the values from the API when available
  const paginatedLogs = logs;

  // Ensure current page is valid when total pages changes
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'debug':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      case 'debug':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  // Handle exports
  const handleExport = (type: 'excel' | 'csv' | 'pipe') => {
    // Check if there are logs to export
    if (displayLogs.length === 0) {
      toast({
        title: "Export Failed",
        description: "There are no logs to export. Please adjust your filters or try again.",
        variant: "destructive"
      });
      return;
    }

    setExportLoading(type);

    try {
      // Format the data for export
      const formattedData = formatDataForExport(displayLogs);
      
      // Create CSV content
      let content = '';
      const headers = ['Timestamp', 'Level', 'Message', 'Source', 'Details'];
      
      if (type === 'csv') {
        // CSV format
        content = headers.join(',') + '\n';
        formattedData.forEach(row => {
          content += headers.map(header => {
            // Use type assertion to access properties by string key
            const value = row[header as keyof typeof row];
            // Escape quotes and wrap in quotes if contains comma
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',') + '\n';
        });
      } else if (type === 'pipe') {
        // Pipe-delimited format
        content = headers.join('|') + '\n';
        formattedData.forEach(row => {
          content += headers.map(header => row[header as keyof typeof row]).join('|') + '\n';
        });
      } else {
        // Excel format (actually CSV with .xlsx extension)
        content = headers.join(',') + '\n';
        formattedData.forEach(row => {
          content += headers.map(header => {
            const value = row[header as keyof typeof row];
            return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',') + '\n';
        });
      }
      
      // Create a blob and download link
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on type
      const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
      const filename = type === 'excel' 
        ? `logs_export_${timestamp}.xlsx` 
        : type === 'csv' 
          ? `logs_export_${timestamp}.csv` 
          : `logs_export_${timestamp}.txt`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Successful",
        description: `Logs have been exported as ${type.toUpperCase()}.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting logs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExportLoading(null);
    }
  };

  // Add date range selection handler
  const handleDateRangeChange = () => {
    setCurrentPage(1); // Reset to first page when date range changes
    fetchLogs();
  };

  if (isLoading) {
    return (
      <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 accent-border" />
        </div>
      </Layout>
    );
  }

  // Get unique sources for filtering
  const uniqueSources = Array.from(new Set(logs.map(log => log.source)));

  // Define the columns for the logs table
  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      sortKey: 'timestamp',
      cell: (log: DisplayLogEntry) => (
        <div className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-500 dark:text-[#A1A1A1]">
          <Clock className="h-4 w-4" />
          {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      sortable: true,
      sortKey: 'level',
      cell: (log: DisplayLogEntry) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          {getLevelIcon(log.level)}
          <span className={getLevelColor(log.level)}>
            {log.level.charAt(0).toUpperCase() + log.level.slice(1)}
          </span>
        </div>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      sortable: true,
      sortKey: 'message',
      cell: (log: DisplayLogEntry) => (
        <div className="text-gray-900 dark:text-white">
          {log.message}
        </div>
      ),
    },
    {
      key: 'source',
      header: 'Source',
      sortable: true,
      sortKey: 'source',
      cell: (log: DisplayLogEntry) => (
        <div className="whitespace-nowrap text-sm text-gray-500 dark:text-[#A1A1A1]">
          {log.source}
        </div>
      ),
    },
  ];
  
  // Define export formats
  const exportFormats = [
    {
      type: 'excel' as const,
      label: 'Excel',
      icon: <FileSpreadsheet className="h-4 w-4" />,
    },
    {
      type: 'csv' as const,
      label: 'CSV',
      icon: <File className="h-4 w-4" />,
    },
    {
      type: 'pipe' as const,
      label: 'Pipe',
      icon: <FileCode className="h-4 w-4" />,
    },
  ];
  
  // Format data for export
  const formatDataForExport = (data: DisplayLogEntry[]) => {
    return data.map(log => ({
      Timestamp: format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      Level: log.level,
      Message: log.message,
      Source: log.source,
      Details: log.details || ''
    }));
  };
  
  // Handle row click to expand/collapse details
  const handleRowClick = (log: DisplayLogEntry) => {
    setExpandedLogId(expandedLogId === log.id ? null : log.id);
  };
  
  // Render expanded content
  const renderExpandedContent = (log: DisplayLogEntry) => {
    if (!log.details) return null;
    
    return (
      <div className="text-sm text-gray-700 dark:text-[#A1A1A1]">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Details:</h4>
        <pre className="bg-gray-100 dark:bg-[#2A2A2A] p-3 rounded-md overflow-x-auto">
          {log.details}
        </pre>
      </div>
    );
  };
  
  // Check if a log is expandable
  const isLogExpandable = (log: DisplayLogEntry) => {
    return !!log.details;
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-gray-500 dark:text-[#A1A1A1] hover:text-gray-700 dark:hover:text-white transition-colors"
    >
      {children}
      {sortField === field && (
        <ArrowUpDown className={cn(
          "h-4 w-4 transition-transform",
          sortDirection === 'desc' ? "rotate-180" : ""
        )} />
      )}
    </button>
  );

  return (
    <Layout isAuthenticated={isAuthenticated} isAdmin={isAdmin} noPadding>
      <SubHeader 
        icon={FileText}
        title="Log Viewer"
        subtitle="View and analyze system logs"
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-[#A1A1A1]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page when search query changes
                }}
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#2A2A2A] border border-gray-300 dark:border-[#3A3A3A] rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1); // Reset to first page when search is cleared
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-[#A1A1A1] hover:text-gray-700 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-4 py-2 rounded-md transition-colors",
                showFilters
                  ? "bg-[#205ab2] text-white"
                  : "bg-gray-200 dark:bg-[#2A2A2A] text-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-[#3A3A3A]"
              )}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-[#2A2A2A] rounded-md">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Level Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-2">Log Level</h3>
                  <div className="flex flex-wrap gap-2">
                    {['info', 'warning', 'error', 'debug'].map(level => (
                      <button
                        key={level}
                        onClick={() => toggleLevelFilter(level)}
                        className={cn(
                          "px-3 py-1 text-xs rounded-full transition-colors",
                          levelFilter.includes(level)
                            ? `bg-[#205ab2] text-white`
                            : "bg-white dark:bg-[#3A3A3A] text-gray-700 dark:text-[#A1A1A1] hover:bg-gray-200 dark:hover:bg-[#4A4A4A]"
                        )}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-white mb-2">Source</h3>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSources.map(source => (
                      <button
                        key={source}
                        onClick={() => toggleSourceFilter(source)}
                        className={cn(
                          "px-3 py-1 text-xs rounded-full transition-colors",
                          sourceFilter.includes(source)
                            ? `bg-[#205ab2] text-white`
                            : "bg-white dark:bg-[#3A3A3A] text-gray-700 dark:text-[#A1A1A1] hover:bg-gray-200 dark:hover:bg-[#4A4A4A]"
                        )}
                      >
                        {source}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1 text-xs text-gray-700 dark:text-[#A1A1A1] hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logs Table */}
        <DataTable
          data={displayLogs}
          columns={columns}
          keyField="id"
          exportFormats={exportFormats}
          exportFileName="logs-export"
          formatDataForExport={formatDataForExport}
          onRowClick={handleRowClick}
          expandedContent={renderExpandedContent}
          isExpandable={isLogExpandable}
          noDataMessage="No logs found matching your criteria"
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          defaultRowsPerPage={10}
          externalCurrentPage={currentPage}
          externalItemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1); // Reset to first page when changing items per page
          }}
        />
      </div>
    </Layout>
  );
} 