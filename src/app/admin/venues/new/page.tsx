"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";

export default function NewVenuePage() {
  const { user, token, ready } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    description: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("You must be logged in.");
      return;
    }
    if (!form.name.trim() || !form.address.trim() || !form.city.trim() || !form.state.trim() || !form.zip.trim() || !form.country.trim()) {
      setError("Please fill in name, address, city, state, zip, and country.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const venue = await api.venues.create(
        {
          name: form.name.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zip: form.zip.trim(),
          country: form.country.trim(),
          description: form.description.trim() || null,
        },
        token
      );
      logger.info("Venue created", { venueId: venue.id, name: venue.name });
      router.push(`/admin/venues/${venue.id}/seats`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create venue";
      setError(msg);
      logger.warn("Venue create failed", { message: msg });
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready || !user) return null;

  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-ink-900">
        Add venue
      </h1>
      <p className="mt-2 text-ink-600">
        Create a venue. After saving, you can add sections and seats (e.g. Section A, Row 1, seats 1–20).
      </p>

      <form onSubmit={handleSubmit} className="mt-10 max-w-xl space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink-700">
            Venue name *
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
          <label htmlFor="address" className="block text-sm font-medium text-ink-700">
            Address *
          </label>
          <input
            id="address"
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            required
            className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-ink-700">
              City *
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-ink-700">
              State *
            </label>
            <input
              id="state"
              name="state"
              type="text"
              value={form.state}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-ink-700">
              Zip *
            </label>
            <input
              id="zip"
              name="zip"
              type="text"
              value={form.zip}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-ink-700">
            Country *
          </label>
          <input
            id="country"
            name="country"
            type="text"
            value={form.country}
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
            rows={2}
            className="mt-2 w-full rounded-lg border border-ink-300 px-4 py-3 text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
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
            {submitting ? "Creating..." : "Create venue"}
          </button>
          <Link
            href="/admin/venues"
            className="rounded-lg border border-ink-300 px-6 py-3 font-medium text-ink-700 hover:bg-ink-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
