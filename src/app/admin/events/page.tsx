import Link from "next/link";
import { CalendarDays, MapPin, Plus, Users } from "lucide-react";
import CategoryBadge from "@/components/events/CategoryBadge";
import CapacityBar from "@/components/events/CapacityBar";
import AdminEventFilters from "@/components/admin/EventFilters";
import DeleteEventButton from "@/components/admin/DeleteEventButton";
import { getEvents, getEventStats } from "@/lib/queries";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  fest?: string;
  category?: string;
  status?: string;
};

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const events = await getEvents();
  const stats = await getEventStats(events.map((e) => e.id));

  // Options for the filter dropdowns
  const festMap = new Map<string, string>();
  for (const e of events) {
    if (e.fests) festMap.set(e.fest_id, e.fests.title);
  }
  const festOptions = [...festMap.entries()].map(([value, label]) => ({ value, label }));
  const categories = [...new Set(events.map((e) => e.category as string))];

  // Apply filters
  const now = Date.now();
  const q = (sp.q ?? "").trim().toLowerCase();

  const filtered = events.filter((e) => {
    const s = stats[e.id];
    const registered = s?.registered_count ?? 0;
    const waitlist = s?.waitlist_count ?? 0;
    const seatsLeft = e.capacity - registered;
    const startsAt = new Date(e.start_time).getTime();

    if (q && !`${e.title} ${e.venue ?? ""}`.toLowerCase().includes(q)) return false;
    if (sp.fest && e.fest_id !== sp.fest) return false;
    if (sp.category && e.category !== sp.category) return false;
    if (sp.status === "open" && seatsLeft <= 0) return false;
    if (sp.status === "full" && seatsLeft > 0) return false;
    if (sp.status === "waitlist" && waitlist <= 0) return false;
    if (sp.status === "upcoming" && startsAt < now) return false;
    if (sp.status === "past" && startsAt >= now) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">Events</h1>
          <p className="mt-1 text-slate-600">
            Create and edit events, or pick one to manage its participants.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          <Plus size={16} />
          New event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-slate-500">No events yet.</p>
          <Link
            href="/admin/events/new"
            className="mt-4 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Create the first event
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <AdminEventFilters fests={festOptions} categories={categories} />
            <p className="mb-3 text-sm text-slate-500">
              Showing {filtered.length} of {events.length} events
            </p>
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No events match these filters.
            </p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((e) => {
                const s = stats[e.id];
                return (
                  <li
                    key={e.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0 lg:flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CategoryBadge category={e.category} />
                        {e.fests && <span className="text-xs text-slate-500">{e.fests.title}</span>}
                      </div>
                      <h2 className="mt-1.5 font-bold text-navy">{e.title}</h2>
                      <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDateTime(e.start_time)}
                        </span>
                        {e.venue && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            {e.venue}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Users size={14} />
                          {s?.waitlist_count ?? 0} on waitlist
                        </span>
                      </div>
                    </div>

                    <CapacityBar
                      className="w-full lg:w-64"
                      registered={s?.registered_count ?? 0}
                      capacity={e.capacity}
                    />

                    <div className="flex flex-wrap items-start gap-2">
                      <Link
                        href={`/admin/events/${e.id}/participants`}
                        className="rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark"
                      >
                        Participants
                      </Link>
                      <Link
                        href={`/admin/events/${e.id}/edit`}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-navy hover:bg-slate-50"
                      >
                        Edit
                      </Link>
                      <DeleteEventButton
                        eventId={e.id}
                        title={e.title}
                        registrationCount={(s?.registered_count ?? 0) + (s?.waitlist_count ?? 0)}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}