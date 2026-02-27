import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EventDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  let event = null;
  try {
    event = await api.events.get(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href="/events" className="mb-8 inline-flex text-sm text-ink-600 hover:text-ink-900">
        Back to events
      </Link>
      <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lg">
        <div className="aspect-[21/9] bg-ink-100">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-400">ticket</div>
          )}
        </div>
        <div className="p-8 sm:p-12">
          <h1 className="font-display text-3xl font-normal text-ink-900 sm:text-4xl">
            {event.name}
          </h1>
          <p className="mt-4 text-lg text-ink-600">
            {formatDate(event.startDate)} - {formatDate(event.endDate)}
          </p>
          {event.description && <p className="mt-6 text-ink-600">{event.description}</p>}
          <Link
            href={`/events/${event.id}/seats`}
            className="mt-8 inline-flex rounded-lg bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-md hover:bg-brand-700"
          >
            Choose seats
          </Link>
        </div>
      </div>
    </div>
  );
}
