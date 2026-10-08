import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import { getEvents, getEventStats } from "@/lib/queries";

export async function FeaturedEvents() {
  const all = await getEvents();
  const now = Date.now();

  // Registration still open, soonest events first
  const events = all
    .filter((e) => new Date(e.registration_deadline).getTime() >= now)
    .slice(0, 3);

  const stats = await getEventStats(events.map((e) => e.id));

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy">Featured events</h2>
          <p className="mt-1 text-sm text-slate-600">Registration is open. Grab your seat.</p>
        </div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
        >
          View all events <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No events are open for registration right now.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              registered={stats[e.id]?.registered_count ?? 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default FeaturedEvents;