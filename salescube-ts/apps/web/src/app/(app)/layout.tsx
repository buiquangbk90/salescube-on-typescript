'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/customers', label: 'Khách hàng' },
  { href: '/products', label: 'Sản phẩm' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (initialized && !user) router.replace('/login');
  }, [initialized, user, router]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Đang khởi tạo...
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center gap-6 border-b border-gray-200 bg-white px-6 py-3">
        <span className="text-lg font-bold">SalesCube</span>
        <nav className="flex flex-1 gap-4 text-sm">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + '/');
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded px-3 py-1.5 transition ${
                  active ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600">
            {user.name} <span className="text-gray-400">({user.roles.join(', ')})</span>
          </span>
          <button
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
          >
            Đăng xuất
          </button>
        </div>
      </header>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
