'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, FileSpreadsheet, File, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export type SortDirection = 'asc' | 'desc';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortKey?: string;
}

export interface ExportFormat {
  type: 'excel' | 'csv' | 'pipe';
  label: string;
  icon: React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  exportFormats?: ExportFormat[];
  exportFileName?: string;
  formatDataForExport?: (data: T[]) => Record<string, any>[];
  onRowClick?: (item: T) => void;
  expandedContent?: (item: T) => React.ReactNode;
  isExpandable?: (item: T) => boolean;
  noDataMessage?: string;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  className?: string;
  // External pagination props
  externalCurrentPage?: number;
  externalItemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  exportFormats,
  exportFileName = 'export',
  formatDataForExport,
  onRowClick,
  expandedContent,
  isExpandable,
  noDataMessage = 'No data found',
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  defaultRowsPerPage = 10,
  className,
  // External pagination props
  externalCurrentPage,
  externalItemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: DataTableProps<T>) {
  // State for sorting
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // State for pagination - use external state if provided
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalItemsPerPage, setInternalItemsPerPage] = useState(defaultRowsPerPage);
  
  // Use external pagination state if provided, otherwise use internal state
  const currentPage = externalCurrentPage !== undefined ? externalCurrentPage : internalCurrentPage;
  const itemsPerPage = externalItemsPerPage !== undefined ? externalItemsPerPage : internalItemsPerPage;
  
  // State for expanded rows
  const [expandedRowKey, setExpandedRowKey] = useState<any>(null);
  
  // State for export loading
  const [exportLoading, setExportLoading] = useState<'excel' | 'csv' | 'pipe' | null>(null);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortField) return data;
    
    return [...data].sort((a: any, b: any) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      // Handle date sorting
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      // Handle string dates
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        // Try to parse as dates
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortDirection === 'asc' 
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }
      }
      
      // Handle string/number sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle number sorting
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [data, sortField, sortDirection]);

  // Calculate pagination
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedData = sortedData.slice(startIndex, endIndex);
  
  // Adjust current page if it's greater than total pages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      if (onPageChange) {
        onPageChange(totalPages);
      } else {
        setInternalCurrentPage(totalPages);
      }
    }
  }, [totalPages, currentPage, onPageChange]);

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    // Reset to first page when sort changes
    if (onPageChange) {
      onPageChange(1);
    } else {
      setInternalCurrentPage(1);
    }
  };

  // Update goToPage to use external handler if provided
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      if (onPageChange) {
        onPageChange(page);
      } else {
        setInternalCurrentPage(page);
      }
    }
  };
  
  // Update handleItemsPerPageChange to use external handler if provided
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = Number(e.target.value);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    } else {
      setInternalItemsPerPage(newItemsPerPage);
      setInternalCurrentPage(1); // Reset to first page when rows per page changes
    }
  };

  // Handle row click
  const handleRowClick = (item: T) => {
    if (onRowClick) {
      onRowClick(item);
    } else if (expandedContent && isExpandable && isExpandable(item)) {
      setExpandedRowKey(expandedRowKey === item[keyField] ? null : item[keyField]);
    }
  };

  // Handle export
  const handleExport = (type: 'excel' | 'csv' | 'pipe') => {
    // Check if there is data to export
    if (sortedData.length === 0) {
      toast({
        title: "Export Failed",
        description: "There is no data to export. Please adjust your filters or try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Set loading state
    setExportLoading(type);
    
    try {
      // Format data for export
      const exportData = formatDataForExport 
        ? formatDataForExport(sortedData)
        : sortedData.map((item: any) => {
            const formattedItem: Record<string, any> = {};
            columns.forEach(column => {
              const key = column.key;
              const value = item[key];
              formattedItem[column.header?.toString() || key] = value;
            });
            return formattedItem;
          });
      
      let content = '';
      let fileName = `${exportFileName}-${format(new Date(), 'yyyy-MM-dd')}.`;
      let mimeType = '';
      
      if (type === 'excel') {
        // For Excel, we'll create a CSV with a BOM (Byte Order Mark) which Excel recognizes
        content = '\uFEFF'; // BOM for Excel
        
        // Add headers
        content += Object.keys(exportData[0]).join(',') + '\n';
        
        // Add data rows
        exportData.forEach(row => {
          content += Object.values(row).map(value => {
            // Escape quotes and wrap in quotes if contains comma or newline
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(',') + '\n';
        });
        
        fileName += 'xlsx';
        mimeType = 'application/vnd.ms-excel';
      } else if (type === 'csv') {
        // Add headers
        content += Object.keys(exportData[0]).join(',') + '\n';
        
        // Add data rows
        exportData.forEach(row => {
          content += Object.values(row).map(value => {
            // Escape quotes and wrap in quotes if contains comma or newline
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(',') + '\n';
        });
        
        fileName += 'csv';
        mimeType = 'text/csv';
      } else if (type === 'pipe') {
        // Add headers
        content += Object.keys(exportData[0]).join('|') + '\n';
        
        // Add data rows
        exportData.forEach(row => {
          content += Object.values(row).map(value => {
            // Escape pipes in the data
            const stringValue = String(value);
            return stringValue.replace(/\|/g, '\\|');
          }).join('|') + '\n';
        });
        
        fileName += 'txt';
        mimeType = 'text/plain';
      }
      
      // Create a blob and download it
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      setTimeout(() => {
        URL.revokeObjectURL(url);
        // Clear loading state
        setExportLoading(null);
      }, 100);
      
      toast({
        title: "Export Successful",
        description: `${sortedData.length} items exported as ${type.toUpperCase()} format.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Export error:', error);
      // Clear loading state
      setExportLoading(null);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Render sort button
  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
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
    <div className={cn("bg-white dark:bg-[#2A2A2A] rounded-lg overflow-hidden border border-gray-200 dark:border-[#3A3A3A]", className)}>
      {/* Table Header with Row Count and Export Options */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-[#3A3A3A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-500 dark:text-[#A1A1A1]">
          {totalItems === 0 ? (
            <span>No items found</span>
          ) : (
            <>
              Showing <span className="font-medium text-gray-700 dark:text-white">{startIndex + 1}</span> to <span className="font-medium text-gray-700 dark:text-white">{endIndex}</span> of <span className="font-medium text-gray-700 dark:text-white">{totalItems}</span> items
            </>
          )}
        </div>
        
        {/* Export Buttons */}
        {exportFormats && exportFormats.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-300 dark:border-[#3A3A3A] rounded-md overflow-hidden">
              {exportFormats.map((format, index) => (
                <button
                  key={format.type}
                  onClick={() => handleExport(format.type)}
                  title={`Export to ${format.label}`}
                  disabled={sortedData.length === 0 || exportLoading !== null}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 dark:text-[#A1A1A1] transition-colors",
                    index < exportFormats.length - 1 && "border-r border-gray-300 dark:border-[#3A3A3A]",
                    (sortedData.length === 0 || exportLoading !== null)
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-gray-100 dark:hover:bg-[#3A3A3A]"
                  )}
                >
                  {exportLoading === format.type ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                  ) : format.icon}
                  <span className="hidden sm:inline">{format.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-[#A1A1A1]">Rows per page:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="bg-white dark:bg-[#3A3A3A] border border-gray-300 dark:border-[#4A4A4A] rounded-md text-gray-700 dark:text-white text-sm py-1 px-2 focus:outline-none focus:ring-2 focus:ring-[#205ab2] focus:border-transparent"
          >
            {rowsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            {totalItems > Math.max(...rowsPerPageOptions) && (
              <option value={totalItems}>All ({totalItems})</option>
            )}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-[#1C1C1C] border-b border-gray-200 dark:border-[#3A3A3A]">
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#A1A1A1] uppercase tracking-wider"
                >
                  {column.sortable && column.sortKey ? (
                    <SortButton field={column.sortKey}>
                      {column.header}
                    </SortButton>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#3A3A3A]">
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <React.Fragment key={String(item[keyField])}>
                  <tr 
                    onClick={() => handleRowClick(item)}
                    className={cn(
                      "transition-colors",
                      (onRowClick || (expandedContent && isExpandable && isExpandable(item))) && 
                      "hover:bg-gray-100 dark:hover:bg-[#3A3A3A] cursor-pointer"
                    )}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 text-sm">
                        {column.cell(item)}
                      </td>
                    ))}
                  </tr>
                  {expandedContent && expandedRowKey === item[keyField] && (
                    <tr className="bg-gray-50 dark:bg-[#252525]">
                      <td colSpan={columns.length} className="px-6 py-4">
                        {expandedContent(item)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500 dark:text-[#A1A1A1]">
                  {noDataMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-[#3A3A3A] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-gray-500 dark:text-[#A1A1A1]">
          {totalItems === 0 ? (
            <span>No items found</span>
          ) : (
            <>
              Showing <span className="font-medium text-gray-700 dark:text-white">{startIndex + 1}</span> to <span className="font-medium text-gray-700 dark:text-white">{endIndex}</span> of <span className="font-medium text-gray-700 dark:text-white">{totalItems}</span> items
              <span className="ml-2">
                (Page <span className="font-medium text-gray-700 dark:text-white">{currentPage}</span> of <span className="font-medium text-gray-700 dark:text-white">{totalPages}</span>)
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1 || totalItems === 0}
            className={cn(
              "p-2 rounded-md transition-colors",
              currentPage === 1 || totalItems === 0
                ? "text-gray-400 dark:text-[#6A6A6A] cursor-not-allowed"
                : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#3A3A3A]"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {/* Page Numbers */}
          <div className="flex items-center">
            {totalItems > 0 && (() => {
              // Determine how many page buttons to show based on total rows
              let maxVisiblePages = 5; // Default
              
              if (totalItems > 100) {
                maxVisiblePages = 7;
              } else if (totalItems > 50) {
                maxVisiblePages = 6;
              }
              
              // Calculate which page numbers to show
              let pageNumbers: number[] = [];
              
              if (totalPages <= maxVisiblePages) {
                // If we have fewer pages than max visible, show all pages
                pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
              } else {
                // Always include first and last page
                pageNumbers.push(1);
                
                // Calculate middle pages
                let startPage = Math.max(2, currentPage - Math.floor((maxVisiblePages - 2) / 2));
                let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
                
                // Adjust if we're near the end
                if (endPage === totalPages - 1) {
                  startPage = Math.max(2, endPage - (maxVisiblePages - 3));
                }
                
                // Add ellipsis if needed
                if (startPage > 2) {
                  pageNumbers.push(-1); // Use -1 to represent ellipsis
                }
                
                // Add middle pages
                for (let i = startPage; i <= endPage; i++) {
                  pageNumbers.push(i);
                }
                
                // Add ellipsis if needed
                if (endPage < totalPages - 1) {
                  pageNumbers.push(-2); // Use -2 to represent ellipsis
                }
                
                // Add last page
                pageNumbers.push(totalPages);
              }
              
              return pageNumbers.map(pageNum => {
                if (pageNum < 0) {
                  // Render ellipsis
                  return (
                    <span 
                      key={`ellipsis-${pageNum}`} 
                      className="w-8 h-8 flex items-center justify-center text-gray-500 dark:text-[#A1A1A1]"
                    >
                      ...
                    </span>
                  );
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors",
                      currentPage === pageNum
                        ? "bg-[#205ab2] text-white"
                        : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#3A3A3A]"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              });
            })()}
          </div>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalItems === 0}
            className={cn(
              "p-2 rounded-md transition-colors",
              currentPage === totalPages || totalItems === 0
                ? "text-gray-400 dark:text-[#6A6A6A] cursor-not-allowed"
                : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-[#3A3A3A]"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 