import FestFilters from "@/components/fests/FestFilters";
import FestListCard from "@/components/fests/FestListCard";
import { getEvents, getFests } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function FestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const [fests, events] = await Promise.all([getFests(sp), getEvents()]);

  const countByFest: Record<string, number> = {};
  events.forEach((e) => {
    countByFest[e.fest_id] = (countByFest[e.fest_id] ?? 0) + 1;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Fests</h1>
      <p className="mb-6 mt-1 text-slate-600">Browse all fests and pick the events you want to join.</p>

      <FestFilters q={sp.q} status={sp.status} />

      <p className="mt-6 text-sm text-slate-500">
        {fests.length} fest{fests.length === 1 ? "" : "s"} found
      </p>

      {fests.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No fests match your search.
        </p>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fests.map((f) => (
            <FestListCard key={f.id} fest={f} eventCount={countByFest[f.id] ?? 0} />
          ))}
        </div>
      )}
    </main>
  );
}