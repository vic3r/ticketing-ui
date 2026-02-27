'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

export function Header() {
  const { user, logout, ready } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/60 bg-brand-50/95 backdrop-blur supports-[backdrop-filter]:bg-brand-50/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-2xl font-normal tracking-tight text-brand-800 hover:text-brand-700"
        >
          TicketFlow
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/events"
            className="text-sm font-medium text-ink-600 hover:text-ink-900"
          >
            Events
          </Link>
          {ready && (
            <>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-ink-600">{user.name}</span>
                  <button
                    onClick={logout}
                    className="rounded-lg bg-ink-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-900"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-ink-600 hover:text-ink-900"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
