'use client';

import Link from 'next/link';
import { use } from 'react';
import { useCustomer, useUpdateCustomer } from '@/lib/customers-api';
import { CustomerForm } from '../_components/customer-form';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError, error } = useCustomer(id);
  const update = useUpdateCustomer(id);

  if (isLoading) return <div className="text-sm text-gray-500">Đang tải...</div>;
  if (isError) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
        {error instanceof Error ? error.message : 'Lỗi tải dữ liệu'}
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/customers" className="text-sm text-blue-600 hover:underline">
          ← Khách hàng
        </Link>
        <h1 className="text-2xl font-bold">
          {data.code} - {data.name}
        </h1>
      </div>

      {update.isError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {update.error instanceof Error ? update.error.message : 'Cập nhật thất bại'}
        </div>
      )}
      {update.isSuccess && (
        <div className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          Đã lưu thay đổi
        </div>
      )}

      <CustomerForm
        defaultValues={{
          code: data.code,
          name: data.name,
          nameKana: data.nameKana ?? undefined,
          abbr: data.abbr ?? undefined,
          zipCode: data.zipCode ?? undefined,
          address1: data.address1 ?? undefined,
          address2: data.address2 ?? undefined,
          contactName: data.contactName ?? undefined,
          phone: data.phone ?? undefined,
          email: data.email ?? undefined,
          taxShift: data.taxShift,
          taxFraction: data.taxFraction,
          priceFraction: data.priceFraction,
          cutoffGroup: data.cutoffGroup ?? undefined,
          cutoffDay: data.cutoffDay ?? undefined,
          paybackCycle: data.paybackCycle,
          remarks: data.remarks ?? undefined,
        }}
        submitLabel="Cập nhật"
        lockCode
        onSubmit={async (values) => {
          const { code: _code, ...rest } = values;
          await update.mutateAsync(rest);
        }}
      />
    </div>
  );
}
