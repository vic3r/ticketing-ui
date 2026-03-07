"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";
import type { Venue } from "@/types/api";

export default function NewEventPage() {
  const { user, token, ready } = useAuth();
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    venueId: "",
    name: "",
    description: "",
    imageUrl: "",
    startDate: "",
    startTime: "18:00",
    endDate: "",
    endTime: "22:00",
    isPublished: false,
  });

  useEffect(() => {
    if (!ready || !user || user.role !== "admin") return;
    api.venues
      .list()
      .then((list) => {
        setVenues(list);
        if (list.length > 0 && !form.venueId) setForm((f) => ({ ...f, venueId: list[0].id }));
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load venues");
        logger.warn("Venues list failed", { message: e instanceof Error ? e.message : "" });
      })
      .finally(() => setLoading(false));
  }, [ready, user]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !form.venueId || !form.name.trim()) {
      setError("Please select a venue and enter an event name.");
      return;
    }
    const start = new Date(`${form.startDate}T${form.startTime}`);
    const end = new Date(`${form.endDate}T${form.endTime}`);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      setError("Please set valid start and end date/time.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const event = await api.events.create(
        {
          venueId: form.venueId,
          organizerId: null,
          name: form.name.trim(),
          description: form.description.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          isPublished: form.isPublished,
        },
        token
      );
      logger.info("Event created", { eventId: event.id, name: event.name });
      router.push(`/events/${event.id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create event";
      setError(msg);
      logger.warn("Event create failed", { message: msg });
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready || !user) return null;

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-ink-900">
        Create event
      </h1>
      <p className="mt-2 text-ink-600">
        Choose a venue and set event details. Seats from the venue will be available for this event.
      </p>

      {loading ? (
        <div className="mt-10">
          <p className="text-ink-600">Loading venues...</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-ink-700">
            No venues yet. Create a venue and add seats first, then you can create events.
          </p>
          <Link
            href="/admin/venues/new"
            className="mt-4 inline-block font-medium text-brand-600 hover:underline"
          >
            Create venue →
          </Link>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="mt-10 max-w-xl space-y-6">
        <div>
          <label htmlFor="venueId" className="block text-sm font-medium text-ink-700">
            Venue *
          </label>
          <select
            id="venueId"
            name="venueId"
            value={form.venueId}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} – {v.city}, {v.state}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink-700">
            Event name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-ink-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-ink-700">
            Image URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-ink-700">
              Start date *
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-ink-700">
              Start time
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              value={form.startTime}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-ink-700">
              End date *
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={form.endDate}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-ink-700">
              End time
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              value={form.endTime}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isPublished"
            name="isPublished"
            type="checkbox"
            checked={form.isPublished}
            onChange={handleChange}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-ink-700">
            Publish event (show on public events list)
          </label>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create event"}
          </button>
          <Link
            href="/admin"
            className="rounded-lg border border-ink-300 px-6 py-3 font-medium text-ink-700 hover:bg-ink-50"
          >
            Cancel
          </Link>
        </div>
      </form>
      )}
    </div>
  );
}
