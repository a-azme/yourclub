import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/events/EventFilters";
import { getEvents, getEventStats, getFests } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; fest?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const [fests, events] = await Promise.all([getFests(), getEvents(sp)]);
  const stats = await getEventStats(events.map((e) => e.id));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Events</h1>
      <p className="mb-6 mt-1 text-slate-600">Search and filter events across all fests.</p>

      <EventFilters
        fests={fests.map((f) => ({ id: f.id, title: f.title }))}
        q={sp.q}
        category={sp.category}
        fest={sp.fest}
        sort={sp.sort}
      />

      <p className="mt-6 text-sm text-slate-500">
        {events.length} event{events.length === 1 ? "" : "s"} found
      </p>

      {events.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No events match your filters. Try a different search.
        </p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} registered={stats[e.id]?.registered_count ?? 0} />
          ))}
        </div>
      )}
    </main>
  );
}