import { notFound } from "next/navigation";
import EventCard from "@/components/events/EventCard";
import FestHeader from "@/components/fests/FestHeader";
import { getEvents, getEventStats, getFest } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function FestDetailPage({
  params,
}: {
  params: Promise<{ festId: string }>;
}) {
  const { festId } = await params;
  const fest = await getFest(festId);
  if (!fest) notFound();

  const events = await getEvents({ fest: festId });
  const stats = await getEventStats(events.map((e) => e.id));

  return (
    <main>
      <FestHeader fest={fest} eventCount={events.length} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {fest.description && (
          <p className="max-w-3xl leading-relaxed text-slate-700">{fest.description}</p>
        )}

        <h2 className="mt-8 text-xl font-bold text-navy">Events ({events.length})</h2>

        {events.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No events in this fest yet.
          </p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} registered={stats[e.id]?.registered_count ?? 0} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}