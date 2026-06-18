'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ProductDetail } from '@/components/products/ProductDetail';
import { ProductForm } from '@/components/products/ProductForm';
import type { Product, CreateProductInput } from '@salescube/shared';

// API functions
const fetchProduct = async (id: string) => {
  const response = await fetch(`/api/products/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  return response.json();
};

const updateProduct = async (id: string, data: Partial<CreateProductInput>) => {
  const response = await fetch(`/api/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update product');
  }
  return response.json();
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  
  const id = params.id as string;
  const queryClient = useQueryClient();

  // Fetch product
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateProductInput>) => updateProduct(id, data),
    onSuccess: () => {
      toast.success('Sản phẩm đã được cập nhật thành công');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error('Không thể cập nhật sản phẩm');
      console.error(error);
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = (data: Partial<CreateProductInput>) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleBack = () => {
    router.push('/products');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.</div>
          <button
            onClick={handleBack}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách sản phẩm
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">Mã sản phẩm: {product.code}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Detail/Form */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sửa sản phẩm</h3>
              <ProductForm
                initialData={product}
                onSubmit={handleUpdate}
                isLoading={updateMutation.isPending}
                onCancel={handleCancel}
              />
            </div>
          ) : (
            <ProductDetail
              product={product}
              onEdit={handleEdit}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h3>
            <div className="space-y-3">
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Sửa thông tin
                </button>
              )}
              <button
                onClick={() => window.open(`/products/${id}/print`, '_blank')}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                In thông tin
              </button>
            </div>
          </div>

          {/* Product Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Trạng thái</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Trạng thái hoạt động</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  product.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Loại thuế</span>
                <span className="text-sm font-medium text-gray-900">
                  {product.taxCategory === 'STANDARD' ? '10%' : 
                   product.taxCategory === 'REDUCED' ? '8%' : '0%'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Loại sản phẩm</span>
                <span className="text-sm font-medium text-gray-900">
                  {product.salesType === 'SALES' ? 'Hàng hóa' : 
                   product.salesType === 'NEWS' ? 'Báo chí' : 'Quảng cáo'}
                </span>
              </div>
            </div>
          </div>

          {/* Price Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin giá</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Giá vốn</span>
                <span className="text-sm font-medium text-gray-900">
                  {product.costPrice ? new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY',
                  }).format(product.costPrice) : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Giá bán</span>
                <span className="text-sm font-medium text-gray-900">
                  {product.sellingPrice ? new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY',
                  }).format(product.sellingPrice) : '-'}
                </span>
              </div>
              {product.costPrice && product.sellingPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Biên lợi nhuận</span>
                  <span className={`text-sm font-medium ${
                    ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100 > 20 ? 'text-green-600' : 
                    ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100 > 10 ? 'text-yellow-600' : 
                    ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100 > 0 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
