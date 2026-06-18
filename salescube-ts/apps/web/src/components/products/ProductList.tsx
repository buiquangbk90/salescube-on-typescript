'use client';

import React, { useState } from 'react';
import type { Product, ProductSalesType, TaxCategory } from '@salescube/shared';

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onView?: (product: Product) => void;
}

export function ProductList({ products, isLoading, onEdit, onDelete, onView }: ProductListProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const getSalesTypeLabel = (salesType: ProductSalesType) => {
    switch (salesType) {
      case 'SALES': return 'Hàng hóa';
      case 'NEWS': return 'Báo chí';
      case 'WEB': return 'Quảng cáo';
      default: return salesType;
    }
  };

  const getTaxCategoryLabel = (taxCategory: TaxCategory) => {
    switch (taxCategory) {
      case 'STANDARD': return '10%';
      case 'REDUCED': return '8%';
      case 'EXEMPT': return '0%';
      default: return taxCategory;
    }
  };

  const getTaxCategoryColor = (taxCategory: TaxCategory) => {
    switch (taxCategory) {
      case 'STANDARD': return 'bg-blue-100 text-blue-800';
      case 'REDUCED': return 'bg-green-100 text-green-800';
      case 'EXEMPT': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">Không có sản phẩm nào</div>
        <div className="text-gray-400">Hãy tạo sản phẩm mới để bắt đầu</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={selectedProducts.length === products.length && products.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mã SP
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tên sản phẩm
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thuế
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giá vốn
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Giá bán
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lợi nhuận
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Thao tác</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => {
            const profitMargin = product.costPrice && product.sellingPrice 
              ? ((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100 
              : 0;

            return (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.code}</div>
                  {product.janCode && (
                    <div className="text-sm text-gray-500">{product.janCode}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  {product.nameKana && (
                    <div className="text-sm text-gray-500">{product.nameKana}</div>
                  )}
                  {product.unit && (
                    <div className="text-xs text-gray-400">Đơn vị: {product.unit}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{getSalesTypeLabel(product.salesType)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTaxCategoryColor(product.taxCategory)}`}>
                    {getTaxCategoryLabel(product.taxCategory)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(product.costPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(product.sellingPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <span className={`font-medium ${
                      profitMargin > 20 ? 'text-green-600' : 
                      profitMargin > 10 ? 'text-yellow-600' : 
                      profitMargin > 0 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {onView && (
                      <button
                        onClick={() => onView(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Xem
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(product)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Sửa
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(product)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
