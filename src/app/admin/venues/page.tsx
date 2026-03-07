"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";
import type { Venue } from "@/types/api";

export default function AdminVenuesPage() {
  const { user, ready } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !user || user.role !== "admin") return;
    api.venues
      .list()
      .then(setVenues)
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load venues");
        logger.warn("Venues list failed", { message: e instanceof Error ? e.message : "" });
      })
      .finally(() => setLoading(false));
  }, [ready, user]);

  if (!ready || !user) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-normal text-ink-900">
          Venues
        </h1>
        <Link
          href="/admin/venues/new"
          className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white transition hover:bg-brand-700"
        >
          Add venue
        </Link>
      </div>
      <p className="mt-2 text-ink-600">
        Create venues and add sections/seats. Then create events that use a venue&apos;s seat map.
      </p>

      {loading ? (
        <p className="mt-10 text-ink-600">Loading...</p>
      ) : error ? (
        <p className="mt-10 text-red-600">{error}</p>
      ) : venues.length === 0 ? (
        <div className="mt-10 rounded-lg border border-ink-200 bg-ink-50 p-6 text-center">
          <p className="text-ink-600">No venues yet.</p>
          <Link
            href="/admin/venues/new"
            className="mt-4 inline-block font-medium text-brand-600 hover:underline"
          >
            Create your first venue →
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {venues.map((v) => (
            <li
              key={v.id}
              className="flex items-center justify-between rounded-xl border border-ink-200 bg-white p-4 shadow-sm"
            >
              <div>
                <h2 className="font-display text-lg font-normal text-ink-900">
                  {v.name}
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  {v.address}, {v.city}, {v.state} {v.zip}
                </p>
              </div>
              <Link
                href={`/admin/venues/${v.id}/seats`}
                className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                Add / edit seats
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
