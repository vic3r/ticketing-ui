"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/events");
    }
  }, [user, ready, router]);

  if (!ready || !user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-ink-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <nav className="mb-8 flex gap-4 border-b border-ink-200 pb-4">
        <Link
          href="/admin"
          className="text-sm font-medium text-ink-600 hover:text-ink-900"
        >
          Dashboard
        </Link>
        <Link
          href="/admin/events/new"
          className="text-sm font-medium text-ink-600 hover:text-ink-900"
        >
          Create event
        </Link>
        <Link
          href="/admin/venues"
          className="text-sm font-medium text-ink-600 hover:text-ink-900"
        >
          Venues
        </Link>
      </nav>
      {children}
    </div>
  );
}
