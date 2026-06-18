'use client';

import React, { useState } from 'react';
import type { ProductSalesType, TaxCategory } from '@salescube/shared';

interface ProductSearchProps {
  onSearch: (query: string) => void;
  onFilter: (filters: ProductFilters) => void;
  isLoading?: boolean;
}

export interface ProductFilters {
  salesType?: ProductSalesType;
  taxCategory?: TaxCategory;
  isActive?: boolean;
}

export function ProductSearch({ onSearch, onFilter, isLoading }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({});

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilter({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tìm kiếm theo mã, tên sản phẩm, mã JAN..."
            />
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
            hasActiveFilters 
              ? 'border-blue-500 text-blue-700 bg-blue-50' 
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Bộ lọc
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {Object.values(filters).filter(v => v !== undefined).length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại sản phẩm
              </label>
              <select
                value={filters.salesType || ''}
                onChange={(e) => handleFilterChange('salesType', e.target.value || undefined)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="SALES">Hàng hóa thông thường</option>
                <option value="NEWS">Báo chí</option>
                <option value="WEB">Quảng cáo Web</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại thuế
              </label>
              <select
                value={filters.taxCategory || ''}
                onChange={(e) => handleFilterChange('taxCategory', e.target.value || undefined)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="STANDARD">10% (Tiêu chuẩn)</option>
                <option value="REDUCED">8% (Giảm)</option>
                <option value="EXEMPT">0% (Miễn)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('isActive', value === '' ? undefined : value === 'true');
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="true">Đang hoạt động</option>
                <option value="false">Không hoạt động</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
