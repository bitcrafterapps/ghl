'use client';

import React from 'react';
import { DataTable } from './DataTable';
import { Clock, AlertCircle, Info, CheckCircle, FileSpreadsheet, File, FileCode } from 'lucide-react';
import { format } from 'date-fns';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
  details?: string;
}

export function LogsDataTable({ logs }: { logs: LogEntry[] }) {
  const [expandedLogId, setExpandedLogId] = React.useState<string | null>(null);
  
  // Define the columns for the logs table
  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      sortKey: 'timestamp',
      cell: (log: LogEntry) => (
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
      cell: (log: LogEntry) => (
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
      cell: (log: LogEntry) => (
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
      cell: (log: LogEntry) => (
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
  const formatDataForExport = (data: LogEntry[]) => {
    return data.map(log => ({
      Timestamp: format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      Level: log.level,
      Message: log.message,
      Source: log.source,
      Details: log.details || ''
    }));
  };
  
  // Handle row click to expand/collapse details
  const handleRowClick = (log: LogEntry) => {
    setExpandedLogId(expandedLogId === log.id ? null : log.id);
  };
  
  // Render expanded content
  const renderExpandedContent = (log: LogEntry) => {
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
  const isLogExpandable = (log: LogEntry) => {
    return !!log.details;
  };
  
  // Helper functions for log level styling
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'debug':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
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
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };
  
  return (
    <DataTable
      data={logs}
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
    />
  );
} 