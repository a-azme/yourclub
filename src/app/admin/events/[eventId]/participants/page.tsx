import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getEvent, getEventStats } from "@/lib/queries";
import CapacityBar from "@/components/events/CapacityBar";
import ExportButton from "@/components/admin/ExportButton";
import ParticipantTable from "@/components/admin/ParticipantTable";
import { formatDateTime } from "@/lib/utils";
import type { Registration } from "@/types";

export const dynamic = "force-dynamic";

export default async function ParticipantsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const event = await getEvent(eventId);
  if (!event) notFound();

  const supabase = await createClient();
  const [{ data }, statsMap] = await Promise.all([
    supabase
      .from("registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
    getEventStats([eventId]),
  ]);

  const registrations = (data ?? []) as Registration[];
  const stats = statsMap[eventId];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        href="/admin/events"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand"
      >
        <ChevronLeft size={16} /> All events
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy">{event.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {event.fests?.title ? `${event.fests.title} · ` : ""}
            {formatDateTime(event.start_time)}
            {event.venue ? ` · ${event.venue}` : ""}
          </p>
        </div>
        <ExportButton eventId={event.id} />
      </div>

      <div className="mt-5 max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <CapacityBar registered={stats?.registered_count ?? 0} capacity={event.capacity} />
        <p className="mt-2 text-xs text-slate-500">
          {stats?.waitlist_count ?? 0} on waitlist
        </p>
      </div>

      <div className="mt-6">
        <ParticipantTable registrations={registrations} capacity={event.capacity} />
      </div>
    </div>
  );
}