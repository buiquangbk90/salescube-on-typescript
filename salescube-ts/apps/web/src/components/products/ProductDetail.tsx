'use client';

import React from 'react';
import type { Product, ProductSalesType, TaxCategory } from '@salescube/shared';

interface ProductDetailProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onClose?: () => void;
}

export function ProductDetail({ product, onEdit, onClose }: ProductDetailProps) {
  const getSalesTypeLabel = (salesType: ProductSalesType) => {
    switch (salesType) {
      case 'SALES': return 'Hàng hóa thông thường';
      case 'NEWS': return 'Báo chí';
      case 'WEB': return 'Quảng cáo Web';
      default: return salesType;
    }
  };

  const getTaxCategoryLabel = (taxCategory: TaxCategory) => {
    switch (taxCategory) {
      case 'STANDARD': return '10% (Tiêu chuẩn)';
      case 'REDUCED': return '8% (Giảm)';
      case 'EXEMPT': return '0% (Miễn thuế)';
      default: return taxCategory;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const profitMargin = product.costPrice && product.sellingPrice 
    ? ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100 
    : 0;

  const taxRate = product.taxCategory === 'STANDARD' ? 0.10 : 
                  product.taxCategory === 'REDUCED' ? 0.08 : 0.00;
  const taxAmount = product.sellingPrice ? product.sellingPrice * taxRate : 0;
  const priceIncludingTax = product.sellingPrice ? product.sellingPrice + taxAmount : 0;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Chi tiết sản phẩm
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Mã: {product.code}
            </p>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(product)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Sửa
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          {/* Basic Information */}
          <div className="sm:col-span-2">
            <h4 className="text-base font-semibold text-gray-900 mb-4">Thông tin cơ bản</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Mã sản phẩm</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tên sản phẩm</dt>
                <dd className="mt-1 text-sm text-gray-900">{product.name}</dd>
              </div>
              {product.nameKana && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tên (Kana)</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.nameKana}</dd>
                </div>
              )}
              {product.janCode && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mã JAN</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.janCode}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Loại sản phẩm</dt>
                <dd className="mt-1 text-sm text-gray-900">{getSalesTypeLabel(product.salesType)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Loại thuế</dt>
                <dd className="mt-1 text-sm text-gray-900">{getTaxCategoryLabel(product.taxCategory)}</dd>
              </div>
              {product.unit && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Đơn vị</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.unit}</dd>
                </div>
              )}
              {product.packQuantity && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Số lượng đóng gói</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.packQuantity}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                <dd className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </dd>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-4">Thông tin giá</h4>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Giá vốn</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(product.costPrice)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Giá bán</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(product.sellingPrice)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Thuế ({(taxRate * 100).toFixed(0)}%)</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(taxAmount)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Giá đã bao gồm thuế</dt>
                <dd className="mt-1 text-lg font-semibold text-blue-600">
                  {formatCurrency(priceIncludingTax)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Biên lợi nhuận</dt>
                <dd className="mt-1">
                  <span className={`text-lg font-semibold ${
                    profitMargin > 20 ? 'text-green-600' : 
                    profitMargin > 10 ? 'text-yellow-600' : 
                    profitMargin > 0 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </dd>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-4">Thông tin khác</h4>
            <div className="space-y-3">
              {product.description && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mô tả</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(product.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Cập nhật lần cuối</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(product.updatedAt)}</dd>
              </div>
            </div>
          </div>
        </dl>
      </div>
    </div>
  );
}
