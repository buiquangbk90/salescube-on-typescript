'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CreateProductInput, ProductSalesType, TaxCategory } from '@salescube/shared';

const productFormSchema = z.object({
  code: z.string().min(1, 'Mã sản phẩm không được để trống'),
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  nameKana: z.string().optional(),
  janCode: z.string().optional(),
  salesType: z.enum(['SALES', 'NEWS', 'WEB'] as const),
  taxCategory: z.enum(['STANDARD', 'REDUCED', 'EXEMPT'] as const),
  unit: z.string().optional(),
  packQuantity: z.number().int().positive().optional(),
  costPrice: z.number().nonnegative().optional(),
  sellingPrice: z.number().nonnegative().optional(),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export function ProductForm({ initialData, onSubmit, isLoading, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      code: '',
      name: '',
      nameKana: '',
      janCode: '',
      salesType: 'SALES',
      taxCategory: 'STANDARD',
      unit: '',
      packQuantity: undefined,
      costPrice: undefined,
      sellingPrice: undefined,
      description: '',
      ...initialData,
    },
  });

  const onFormSubmit = (data: ProductFormData) => {
    onSubmit(data);
  };

  const handleReset = () => {
    reset();
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Thông tin cơ bản</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mã sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('code')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nhập mã sản phẩm"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nhập tên sản phẩm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên sản phẩm (Kana)
            </label>
            <input
              type="text"
              {...register('nameKana')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nhập tên sản phẩm (tiếng Nhật)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mã JAN (Barcode)
            </label>
            <input
              type="text"
              {...register('janCode')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Nhập mã JAN 13 số"
            />
            {errors.janCode && (
              <p className="mt-1 text-sm text-red-600">{errors.janCode.message}</p>
            )}
          </div>
        </div>

        {/* Classification and Pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Phân loại & Giá</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loại sản phẩm
            </label>
            <select
              {...register('salesType')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="SALES">Hàng hóa thông thường</option>
              <option value="NEWS">Báo chí</option>
              <option value="WEB">Quảng cáo Web</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Loại thuế
            </label>
            <select
              {...register('taxCategory')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="STANDARD">10% (Tiêu chuẩn)</option>
              <option value="REDUCED">8% (Giảm)</option>
              <option value="EXEMPT">0% (Miễn)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Đơn vị
            </label>
            <input
              type="text"
              {...register('unit')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="VD: cái, quyển, kg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Số lượng đóng gói
            </label>
            <input
              type="number"
              {...register('packQuantity', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="VD: 10"
            />
            {errors.packQuantity && (
              <p className="mt-1 text-sm text-red-600">{errors.packQuantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Giá vốn (¥)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('costPrice', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.costPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.costPrice.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Giá bán (¥)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('sellingPrice', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.sellingPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.sellingPrice.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Mô tả
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Nhập mô tả sản phẩm"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
}
