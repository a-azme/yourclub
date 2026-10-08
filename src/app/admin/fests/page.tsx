import Link from "next/link";
import { CalendarDays, MapPin, Plus, Users } from "lucide-react";
import DeleteFestButton from "@/components/admin/DeleteFestButton";
import { getEvents, getFests } from "@/lib/queries";
import { getFestStatus } from "@/lib/fest-status";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminFestsPage() {
  const [fests, events] = await Promise.all([getFests(), getEvents()]);

  const eventCounts: Record<string, number> = {};
  for (const e of events) eventCounts[e.fest_id] = (eventCounts[e.fest_id] ?? 0) + 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Fests</h1>
          <p className="mt-1 text-slate-600">Create, edit and remove fests.</p>
        </div>
        <Link
          href="/admin/fests/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <Plus size={16} />
          New fest
        </Link>
      </div>

      {fests.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-slate-500">No fests yet.</p>
          <Link
            href="/admin/fests/new"
            className="mt-4 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Create the first fest
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {fests.map((f) => {
            const count = eventCounts[f.id] ?? 0;
            return (
              <li
                key={f.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 lg:flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold capitalize text-brand">
                      {getFestStatus(f.start_date, f.end_date)}
                    </span>
                    {f.organizations && (
                      <span className="text-xs text-slate-500">{f.organizations.name}</span>
                    )}
                  </div>
                  <h2 className="mt-1.5 font-bold text-navy">{f.title}</h2>
                  <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {formatDate(f.start_date)} - {formatDate(f.end_date)}
                    </span>
                    {f.venue && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {f.venue}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users size={14} />
                      {count} event{count === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-start gap-2">
                  <Link
                    href={`/admin/fests/${f.id}/edit`}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-navy hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <DeleteFestButton festId={f.id} title={f.title} eventCount={count} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}