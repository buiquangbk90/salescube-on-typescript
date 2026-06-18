'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CreateCustomerInput,
  CustomerDto,
  PaginatedResult,
  UpdateCustomerInput,
} from '@salescube/shared';
import { apiFetch } from './api';

const QK = {
  list: (q: string, page: number) => ['customers', 'list', q, page] as const,
  detail: (id: string) => ['customers', 'detail', id] as const,
};

export function useCustomerList(params: { q: string; page: number; pageSize: number }) {
  return useQuery<PaginatedResult<CustomerDto>>({
    queryKey: QK.list(params.q, params.page),
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params.q) sp.set('q', params.q);
      sp.set('page', String(params.page));
      sp.set('pageSize', String(params.pageSize));
      return apiFetch(`/customers?${sp.toString()}`);
    },
  });
}

export function useCustomer(id: string) {
  return useQuery<CustomerDto>({
    queryKey: QK.detail(id),
    queryFn: () => apiFetch(`/customers/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation<CustomerDto, Error, CreateCustomerInput>({
    mutationFn: (input) =>
      apiFetch('/customers', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation<CustomerDto, Error, UpdateCustomerInput>({
    mutationFn: (input) =>
      apiFetch(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: QK.detail(id) });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => apiFetch(`/customers/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}
