'use client';

import { useQuery } from '@tanstack/react-query';
import type { HealthStatus } from '@salescube/shared';
import { apiUrl } from '@/lib/api';

export function HealthBadge() {
  const { data, isLoading, isError } = useQuery<HealthStatus>({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/health'), { cache: 'no-store' });
      if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
      return res.json();
    },
    refetchInterval: 10_000,
  });

  if (isLoading) return <span className="text-sm text-gray-500">Đang kiểm tra...</span>;
  if (isError || !data) {
    return <span className="text-sm text-red-600">API không phản hồi</span>;
  }

  const ok = data.status === 'ok';
  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-block h-3 w-3 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`}
      />
      <span className="text-sm">
        API: <strong>{data.status}</strong> | DB: <strong>{data.db}</strong>
      </span>
      <span className="ml-auto text-xs text-gray-400">
        {new Date(data.timestamp).toLocaleTimeString('vi-VN')}
      </span>
    </div>
  );
}
