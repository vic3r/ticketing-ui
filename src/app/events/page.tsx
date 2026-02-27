import Link from "next/link";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  let events: Awaited<ReturnType<typeof api.events.list>> = [];
  let error: string | null = null;

  try {
    events = await api.events.list();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load events";
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-ink-600">{error}</p>
        <p className="mt-2 text-sm text-ink-500">
          Ensure the ticketing API is running at{" "}
          {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}
        </p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-ink-600">No events yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-normal text-ink-900">
        Upcoming events
      </h1>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="group overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="aspect-[4/3] bg-ink-100">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-ink-400">
                  <span className="text-4xl"> ticket</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <h2 className="font-display text-xl font-normal text-ink-900 group-hover:text-brand-700">
                {event.name}
              </h2>
              <p className="mt-2 text-sm text-ink-500">
                {formatDate(event.startDate)} – {formatDate(event.endDate)}
              </p>
              {event.description && (
                <p className="mt-2 line-clamp-2 text-sm text-ink-600">
                  {event.description}
                </p>
              )}
              <span className="mt-4 inline-block text-sm font-medium text-brand-600">
                View event →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
