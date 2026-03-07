import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-normal text-ink-900">
        Admin
      </h1>
      <p className="mt-2 text-ink-600">
        Create events and manage venues.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Link
          href="/admin/events/new"
          className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-display text-xl font-normal text-ink-900">
            Create event
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            Create a new event at a venue. Attendees can then browse and select seats.
          </p>
        </Link>
        <Link
          href="/admin/venues"
          className="rounded-xl border border-ink-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <h2 className="font-display text-xl font-normal text-ink-900">
            Venues
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            Add venues and define sections and seats. Events use a venue&apos;s seat map.
          </p>
        </Link>
      </div>
    </div>
  );
}
