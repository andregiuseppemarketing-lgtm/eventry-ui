'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  getValue?: (item: T) => string | number | Date;
}

export interface FilterConfig {
  key: string;
  label: string;
  icon?: ReactNode;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface SortOption {
  value: string;
  label: string;
  ascLabel: string;
  descLabel: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters?: FilterConfig[];
  sortOptions?: SortOption[];
  title?: string;
  defaultItemsPerPage?: number;
  itemsPerPageOptions?: number[];
  searchKeys?: string[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  filters = [],
  sortOptions = [],
  title,
  defaultItemsPerPage = 20,
  itemsPerPageOptions = [10, 20, 50, 100],
  searchKeys = [],
  loading = false,
  emptyMessage = 'Nessun elemento trovato',
  emptyIcon,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>(sortOptions[0]?.value || '');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  // Initialize filter values immediately
  const initialFilterValues: Record<string, string> = {};
  filters.forEach(filter => {
    initialFilterValues[filter.key] = 'ALL';
  });
  const [filterValues, setFilterValues] = useState<Record<string, string>>(initialFilterValues);

  // Filter data
  const filteredData = data.filter(item => {
    // Search filter
    if (searchTerm && searchKeys.length > 0) {
      const matchesSearch = searchKeys.some(key => {
        const value = getNestedValue(item, key);
        return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (!matchesSearch) return false;
    }

    // Custom filters
    for (const filter of filters) {
      const filterValue = filterValues[filter.key];
      if (filterValue && filterValue !== 'ALL') {
        const itemValue = getNestedValue(item, filter.key);
        // Handle null/undefined values
        if (itemValue == null || itemValue !== filterValue) return false;
      }
    }

    return true;
  });

  // Sort data
  const sortedData = sortBy
    ? [...filteredData].sort((a, b) => {
        const column = columns.find(col => col.key === sortBy);
        if (!column) return 0;

        const aValue = column.getValue ? column.getValue(a) : getNestedValue(a, sortBy);
        const bValue = column.getValue ? column.getValue(b) : getNestedValue(b, sortBy);

        let compareValue = 0;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          compareValue = aValue - bValue;
        } else if (aValue instanceof Date && bValue instanceof Date) {
          compareValue = aValue.getTime() - bValue.getTime();
        } else {
          compareValue = String(aValue || '').localeCompare(String(bValue || ''));
        }

        return sortOrder === 'asc' ? compareValue : -compareValue;
      })
    : filteredData;

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Reset to page 1 when filters/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValues, sortBy, sortOrder]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  const currentSortOption = sortOptions.find(opt => opt.value === sortBy);

  return (
    <div className="space-y-6">
      {/* Filters */}
      {(searchKeys.length > 0 || filters.length > 0 || sortOptions.length > 0) && (
        <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
          <CardContent className="p-4 sm:p-6">
            {/* Search and Filters */}
            {(searchKeys.length > 0 || filters.length > 0) && (
              <div className={`grid grid-cols-1 md:grid-cols-${Math.min(3, (searchKeys.length > 0 ? 1 : 0) + filters.length)} gap-4`}>
                {/* Search */}
                {searchKeys.length > 0 && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      <Search className="w-4 h-4 inline mr-2" />
                      Cerca
                    </label>
                    <input
                      type="text"
                      placeholder="Cerca..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {/* Custom Filters */}
                {filters.map(filter => (
                  <div key={filter.key}>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      {filter.icon && <span className="inline mr-2">{filter.icon}</span>}
                      {filter.label}
                    </label>
                    {filter.type === 'select' ? (
                      <select
                        value={filterValues[filter.key] || 'ALL'}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="ALL">Tutti</option>
                        {filter.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder={filter.placeholder}
                        value={filterValues[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Sorting */}
            {sortOptions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      Ordina per
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      Direzione
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="asc">{currentSortOption?.ascLabel || 'Crescente'}</option>
                      <option value="desc">{currentSortOption?.descLabel || 'Decrescente'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
        {title && (
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-white">
              {title} ({sortedData.length})
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm sm:text-base">Caricamento...</p>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {emptyIcon && <div className="mx-auto mb-4">{emptyIcon}</div>}
              <p className="text-sm sm:text-base">{emptyMessage}</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10">
                    {columns.map(column => (
                      <th
                        key={column.key}
                        className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      {columns.map(column => (
                        <td key={column.key} className="px-3 sm:px-4 py-3">
                          {column.render
                            ? column.render(item)
                            : String(getNestedValue(item, column.key) || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {sortedData.length > 0 && (
            <div className="mt-6 px-4 sm:px-6 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-4">
              {/* Items per page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Mostra</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {itemsPerPageOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-400">elementi</span>
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  Pagina {currentPage} di {totalPages} ({sortedData.length} totali)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page numbers */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
