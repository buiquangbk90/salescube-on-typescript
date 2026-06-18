'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateCustomer } from '@/lib/customers-api';
import { CustomerForm } from '../_components/customer-form';

export default function NewCustomerPage() {
  const router = useRouter();
  const create = useCreateCustomer();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/customers" className="text-sm text-blue-600 hover:underline">
          ← Khách hàng
        </Link>
        <h1 className="text-2xl font-bold">Tạo khách hàng mới</h1>
      </div>

      {create.isError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {create.error instanceof Error ? create.error.message : 'Tạo thất bại'}
        </div>
      )}

      <CustomerForm
        submitLabel="Tạo mới"
        onSubmit={async (values) => {
          const c = await create.mutateAsync(values);
          router.push(`/customers/${c.id}`);
        }}
      />
    </div>
  );
}
