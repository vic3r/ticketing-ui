"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";
import type { Venue } from "@/types/api";

interface SeatInput {
  section: string;
  row?: string;
  seatNumber?: number;
}

export default function VenueSeatsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, token, ready } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bulk, setBulk] = useState({
    section: "A",
    rowStart: "1",
    rowEnd: "1",
    seatStart: 1,
    seatEnd: 10,
  });

  useEffect(() => {
    if (!ready || !user || !id) return;
    api.venues
      .get(id)
      .then(setVenue)
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load venue");
      })
      .finally(() => setLoading(false));
  }, [ready, user, id]);

  function handleBulkChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setBulk((prev) => ({
      ...prev,
      [name]: name === "section" ? value : name.includes("seat") ? parseInt(value, 10) || 0 : value,
    }));
  }

  async function handleAddBulk(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !id) return;
    const start = parseInt(bulk.rowStart, 10) || 1;
    const end = parseInt(bulk.rowEnd, 10) || start;
    const seatStart = bulk.seatStart || 1;
    const seatEnd = bulk.seatEnd || seatStart;
    const seats: SeatInput[] = [];
    for (let r = start; r <= end; r++) {
      for (let s = seatStart; s <= seatEnd; s++) {
        seats.push({ section: bulk.section, row: String(r), seatNumber: s });
      }
    }
    if (seats.length === 0 || seats.length > 500) {
      setError("Generate between 1 and 500 seats.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await api.venues.addSeats(id, { seats }, token);
      setSuccess(`Added ${result.count} seats.`);
      logger.info("Venue seats added", { venueId: id, count: result.count });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add seats");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready || !user) return null;
  if (loading && !venue) {
    return (
      <div className="mt-10">
        <p className="text-ink-600">Loading...</p>
      </div>
    );
  }
  if (error && !venue) {
    return (
      <div className="mt-10">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }
  if (!venue) return null;

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-ink-900">
        Seats for {venue.name}
      </h1>
      <p className="mt-2 text-ink-600">
        Add seats by section, row, and number. Events at this venue will use this seat map.
      </p>

      <div className="mt-10 rounded-xl border border-ink-200 bg-ink-50/50 p-6">
        <h2 className="font-medium text-ink-800">Add seats (bulk)</h2>
        <p className="mt-1 text-sm text-ink-600">
          Example: Section A, Rows 1–5, Seats 1–10 = 50 seats.
        </p>
        <form onSubmit={handleAddBulk} className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="section" className="block text-sm font-medium text-ink-700">
              Section
            </label>
            <input
              id="section"
              name="section"
              type="text"
              value={bulk.section}
              onChange={handleBulkChange}
              placeholder="A"
              className="mt-1 w-24 rounded-lg border border-ink-300 px-3 py-2 text-ink-900"
            />
          </div>
          <div>
            <label htmlFor="rowStart" className="block text-sm font-medium text-ink-700">
              Row from
            </label>
            <input
              id="rowStart"
              name="rowStart"
              type="number"
              min={1}
              value={bulk.rowStart}
              onChange={handleBulkChange}
              className="mt-1 w-20 rounded-lg border border-ink-300 px-3 py-2 text-ink-900"
            />
          </div>
          <div>
            <label htmlFor="rowEnd" className="block text-sm font-medium text-ink-700">
              Row to
            </label>
            <input
              id="rowEnd"
              name="rowEnd"
              type="number"
              min={1}
              value={bulk.rowEnd}
              onChange={handleBulkChange}
              className="mt-1 w-20 rounded-lg border border-ink-300 px-3 py-2 text-ink-900"
            />
          </div>
          <div>
            <label htmlFor="seatStart" className="block text-sm font-medium text-ink-700">
              Seat from
            </label>
            <input
              id="seatStart"
              name="seatStart"
              type="number"
              min={1}
              value={bulk.seatStart}
              onChange={handleBulkChange}
              className="mt-1 w-20 rounded-lg border border-ink-300 px-3 py-2 text-ink-900"
            />
          </div>
          <div>
            <label htmlFor="seatEnd" className="block text-sm font-medium text-ink-700">
              Seat to
            </label>
            <input
              id="seatEnd"
              name="seatEnd"
              type="number"
              min={1}
              value={bulk.seatEnd}
              onChange={handleBulkChange}
              className="mt-1 w-20 rounded-lg border border-ink-300 px-3 py-2 text-ink-900"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add seats"}
          </button>
        </form>
      </div>

      {success && (
        <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800">{success}</p>
      )}
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <div className="mt-10">
        <Link
          href="/admin/venues"
          className="text-sm font-medium text-ink-600 hover:text-ink-900"
        >
          ← Back to venues
        </Link>
      </div>
    </div>
  );
}
