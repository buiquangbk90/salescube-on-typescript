'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCustomerList, useDeleteCustomer } from '@/lib/customers-api';

export default function CustomersListPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError, error } = useCustomerList({ q, page, pageSize });
  const del = useDeleteCustomer();

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Khách hàng</h1>
        <span className="text-sm text-gray-500">{total} kết quả</span>
        <div className="ml-auto flex gap-2">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo mã, tên, kana..."
            className="w-72 rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <Link
            href="/customers/new"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Tạo mới
          </Link>
        </div>
      </div>

      {isError && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Lỗi tải dữ liệu'}
        </div>
      )}

      <div className="overflow-hidden rounded border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Mã</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Tên Kana</th>
              <th className="px-4 py-3">Liên hệ</th>
              <th className="px-4 py-3">Cutoff</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Đang tải...
                </td>
              </tr>
            )}
            {data?.data.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            )}
            {data?.data.map((c) => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2 font-mono">{c.code}</td>
                <td className="px-4 py-2">
                  <Link href={`/customers/${c.id}`} className="text-blue-600 hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-gray-500">{c.nameKana ?? '-'}</td>
                <td className="px-4 py-2 text-gray-500">
                  {c.phone ?? c.email ?? '-'}
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {c.cutoffDay ? `Day ${c.cutoffDay}` : c.cutoffGroup ?? '-'}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => {
                      if (confirm(`Xóa khách hàng ${c.code}?`)) del.mutate(c.id);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
          >
            Trước
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
