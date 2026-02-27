import Link from "next/link";

export default function HomePage() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-100/50 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <div className="text-center">
          <h1 className="font-display text-5xl font-normal tracking-tight text-ink-900 sm:text-6xl">
            Your next live experience starts here
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-600">
            Concerts, shows, and events. Browse, reserve seats, and secure your
            spot with ease.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href="/events"
              className="rounded-lg bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-md transition hover:bg-brand-700"
            >
              Browse events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
