import Link from 'next/link';
import { HealthBadge } from '@/components/health-badge';

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">Tổng quan hệ thống</p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Trạng thái hệ thống
        </h2>
        <HealthBadge />
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Modules
        </h2>
        <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
          <li>
            <Link
              href="/customers"
              className="block rounded border border-blue-200 bg-blue-50 p-3 hover:bg-blue-100"
            >
              <strong>Khách hàng</strong>
              <div className="text-xs text-gray-600">Quản lý khách hàng</div>
            </Link>
          </li>
          <li className="rounded border border-dashed border-gray-300 p-3">
            <strong>Product</strong>
            <div className="text-xs text-gray-400">(sắp tới)</div>
          </li>
          <li className="rounded border border-dashed border-gray-300 p-3">
            <strong>Sales Order</strong>
            <div className="text-xs text-gray-400">(sắp tới)</div>
          </li>
          <li className="rounded border border-dashed border-gray-300 p-3">
            <strong>Invoice</strong>
            <div className="text-xs text-gray-400">(sắp tới)</div>
          </li>
          <li className="rounded border border-dashed border-gray-300 p-3">
            <strong>Deposit</strong>
            <div className="text-xs text-gray-400">(sắp tới)</div>
          </li>
          <li className="rounded border border-dashed border-gray-300 p-3">
            <strong>Reports</strong>
            <div className="text-xs text-gray-400">(sắp tới)</div>
          </li>
        </ul>
      </section>
    </div>
  );
}
