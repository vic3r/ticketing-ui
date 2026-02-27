"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { logger } from "@/lib/logger";
import type { Event, EventSeat } from "@/types/api";

export default function SeatsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, token } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<EventSeat[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    logger.debug("Seats load", { eventId: id });
    Promise.all([api.events.get(id), api.events.seats(id)])
      .then(([ev, s]) => {
        setEvent(ev);
        setSeats(s);
        logger.info("Seats loaded", { eventId: id, seatCount: s.length });
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Failed to load";
        setError(msg);
        logger.warn("Seats load failed", { eventId: id, message: msg });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSeat = useCallback((seatId: string, status: string) => {
    if (status !== "available") return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      return next;
    });
  }, []);

  const reserve = useCallback(async () => {
    if (!user || !token || selected.size === 0 || !id) return;
    setReserving(true);
    setError(null);
    const seatIds = Array.from(selected);
    logger.info("Reservation started", { eventId: id, seatCount: seatIds.length });
    try {
      await api.reservations.create(
        { eventId: id, seatIds },
        token
      );
      logger.info("Reservation success", { eventId: id, seatIds });
      router.push(`/events/${id}/checkout?seatIds=${seatIds.join(",")}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Reservation failed";
      setError(msg);
      logger.warn("Reservation failed", { eventId: id, message: msg });
    } finally {
      setReserving(false);
    }
  }, [user, token, selected, id, router]);

  if (loading || !event) {
    if (error && !event) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-ink-600">Loading...</p>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-ink-600">Please log in to reserve seats.</p>
        <Link href="/login" className="mt-4 inline-block text-brand-600 hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  const availableSeats = seats.filter((s) => s.status === "available");
  const groupedBySection = availableSeats.reduce<Record<string, EventSeat[]>>(
    (acc, s) => {
      (acc[s.section] = acc[s.section] ?? []).push(s);
      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link
        href={`/events/${id}`}
        className="mb-8 inline-flex items-center text-sm text-ink-600 hover:text-ink-900"
      >
        ← Back to event
      </Link>

      <h1 className="font-display text-3xl font-normal text-ink-900">
        Choose your seats
      </h1>
      <p className="mt-2 text-ink-600">{event.name}</p>

      <div className="mt-10 flex flex-col gap-8">
        {Object.entries(groupedBySection).map(([section, secSeats]) => (
          <div key={section}>
            <h2 className="mb-4 font-medium text-ink-700">Section {section}</h2>
            <div className="flex flex-wrap gap-2">
              {secSeats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => toggleSeat(seat.id, seat.status)}
                  disabled={seat.status !== "available"}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    seat.status === "available"
                      ? selected.has(seat.id)
                        ? "bg-brand-600 text-white"
                        : "bg-ink-200 text-ink-800 hover:bg-ink-300"
                      : "cursor-not-allowed bg-ink-100 text-ink-400"
                  }`}
                >
                  {seat.row ?? ""} {seat.seatNumber ?? seat.id.slice(0, 6)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {seats.some((s) => s.status === "reserved" || s.status === "sold") && (
        <div className="mt-8 flex gap-4 text-sm text-ink-600">
          <span>
            <span className="inline-block h-3 w-3 rounded bg-green-400" />{" "}
            Available
          </span>
          <span>
            <span className="inline-block h-3 w-3 rounded bg-ink-300" /> Reserved
          </span>
          <span>
            <span className="inline-block h-3 w-3 rounded bg-ink-200" /> Sold
          </span>
        </div>
      )}

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      )}

      {selected.size > 0 && (
        <div className="mt-10 flex items-center gap-6">
          <p className="font-medium text-ink-800">
            {selected.size} seat{selected.size !== 1 ? "s" : ""} selected
          </p>
          <button
            onClick={reserve}
            disabled={reserving}
            className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            {reserving ? "Reserving..." : "Continue to checkout"}
          </button>
        </div>
      )}
    </div>
  );
}
