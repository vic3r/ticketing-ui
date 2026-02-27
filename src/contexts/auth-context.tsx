'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from '@/types/api';

interface AuthState {
  user: User | null;
  token: string | null;
  ready: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'ticketing-auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    ready: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { token, user } = JSON.parse(stored) as {
          token?: string;
          user?: User;
        };
        if (token && user) setState({ user, token, ready: true });
      }
    } catch {
      // ignore
    }
    if (!state.ready) setState((s) => ({ ...s, ready: true }));
  }, []);

  const persist = useCallback((token: string | null, user: User | null) => {
    if (token && user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? 'Login failed');
      }
      const { token, user } = (await res.json()) as { token: string; user: User };
      persist(token, user);
      setState({ user, token, ready: true });
    },
    [persist]
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message ?? 'Registration failed'
        );
      }
      const { token, user } = (await res.json()) as { token: string; user: User };
      persist(token, user);
      setState({ user, token, ready: true });
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null, null);
    setState({ user: null, token: null, ready: true });
  }, [persist]);

  const setToken = useCallback((token: string | null) => {
    setState((s) => ({ ...s, token }));
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState((s) => ({ ...s, user }));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      setToken,
      setUser,
    }),
    [state, login, register, logout, setToken, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
