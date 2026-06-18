'use client';

import { create } from 'zustand';
import type { AuthUser } from '@salescube/shared';
import { apiFetch, setToken, getToken } from './api';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  login: (code: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  init: async () => {
    if (!getToken()) {
      set({ initialized: true });
      return;
    }
    try {
      const user = await apiFetch<AuthUser>('/auth/me');
      set({ user, initialized: true });
    } catch {
      setToken(null);
      set({ user: null, initialized: true });
    }
  },

  login: async (code, password) => {
    set({ loading: true });
    try {
      const res = await apiFetch<{ accessToken: string; user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ code, password }),
      });
      setToken(res.accessToken);
      set({ user: res.user, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    setToken(null);
    set({ user: null });
  },
}));
