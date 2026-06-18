'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ProductList, ProductSearch, type ProductFilters } from '@/components/products';
import { ProductForm } from '@/components/products/ProductForm';
import { ProductDetail } from '@/components/products/ProductDetail';
import type { Product, CreateProductInput } from '@salescube/shared';

// API functions
const fetchProducts = async (params: { page: number; limit: number; search?: string; filters?: ProductFilters }) => {
  const searchParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    ...(params.search && { search: params.search }),
    ...(params.filters?.salesType && { salesType: params.filters.salesType }),
    ...(params.filters?.taxCategory && { taxCategory: params.filters.taxCategory }),
    ...(params.filters?.isActive !== undefined && { isActive: params.filters.isActive.toString() }),
  });

  const response = await fetch(`/api/products?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
};

const createProduct = async (data: CreateProductInput) => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create product');
  }
  return response.json();
};

const deleteProduct = async (id: string) => {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete product');
  }
};

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const queryClient = useQueryClient();

  // Fetch products
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page, search, filters],
    queryFn: () => fetchProducts({ page, limit: 20, search, filters }),
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success('Sản phẩm đã được tạo thành công');
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error('Không thể tạo sản phẩm');
      console.error(error);
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success('Sản phẩm đã được xóa thành công');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error('Không thể xóa sản phẩm');
      console.error(error);
    },
  });

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const handleFilter = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleCreate = (data: CreateProductInput) => {
    createMutation.mutate(data);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowCreateForm(false);
    setViewingProduct(null);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const handleView = (product: Product) => {
    setViewingProduct(product);
    setEditingProduct(null);
    setShowCreateForm(false);
  };

  const handleCreateNew = () => {
    setShowCreateForm(true);
    setEditingProduct(null);
    setViewingProduct(null);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingProduct(null);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
            <p className="text-gray-600">Quản lý danh mục sản phẩm</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo sản phẩm mới
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <ProductSearch
        onSearch={handleSearch}
        onFilter={handleFilter}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="lg:col-span-2">
          <ProductList
            products={data?.rows || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />

          {/* Pagination */}
          {data && data.total > 20 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {((page - 1) * 20) + 1} đến {Math.min(page * 20, data.total)} trong {data.total} sản phẩm
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  {page}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page * 20 >= data.total}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Create/Edit Form */}
          {(showCreateForm || editingProduct) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProduct ? 'Sửa sản phẩm' : 'Tạo sản phẩm mới'}
              </h3>
              <ProductForm
                initialData={editingProduct || undefined}
                onSubmit={handleCreate}
                isLoading={createMutation.isPending}
                onCancel={handleCancelForm}
              />
            </div>
          )}

          {/* Product Detail */}
          {viewingProduct && (
            <ProductDetail
              product={viewingProduct}
              onEdit={handleEdit}
              onClose={() => setViewingProduct(null)}
            />
          )}

          {/* Statistics */}
          {data && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tổng số sản phẩm</span>
                  <span className="text-sm font-medium text-gray-900">{data.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Sản phẩm đang hoạt động</span>
                  <span className="text-sm font-medium text-green-600">
                    {data.rows.filter((p: Product) => p.isActive).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Sản phẩm không hoạt động</span>
                  <span className="text-sm font-medium text-red-600">
                    {data.rows.filter((p: Product) => !p.isActive).length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
