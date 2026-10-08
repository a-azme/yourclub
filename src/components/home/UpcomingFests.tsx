import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FestCard from "@/components/fests/FestCard";
import { getFests } from "@/lib/queries";

export async function UpcomingFests() {
  const all = await getFests();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });

  // Fests that are live now or still to come (getFests is sorted by start date)
  const fests = all.filter((f) => f.end_date >= today).slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy">Upcoming fests</h2>
          <p className="mt-1 text-sm text-slate-600">Find a fest and browse its events.</p>
        </div>
        <Link
          href="/fests"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
        >
          View all fests <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {fests.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No upcoming fests yet. Check back soon.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fests.map((f) => (
            <FestCard key={f.id} fest={f} />
          ))}
        </div>
      )}
    </section>
  );
}

export default UpcomingFests;