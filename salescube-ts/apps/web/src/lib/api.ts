/**
 * API client helpers for talking to NestJS backend.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const TOKEN_KEY = 'salescube.token';

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${p}`;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type') && init?.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(apiUrl(path), { ...init, headers });

  if (res.status === 204) return undefined as T;

  let body: unknown = undefined;
  const ct = res.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) body = await res.json().catch(() => undefined);

  if (!res.ok) {
    const msg =
      (body as { message?: string } | undefined)?.message ?? `API ${path} failed: ${res.status}`;
    throw new ApiError(msg, res.status, body);
  }
  return body as T;
}
