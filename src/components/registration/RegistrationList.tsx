import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import CancelButton from "@/components/registration/CancelButton";
import { formatDateTime } from "@/lib/utils";
import type { RegistrationWithEvent } from "@/lib/registration-queries";

function Row({ reg }: { reg: RegistrationWithEvent }) {
  const event = reg.events;
  if (!event) return null;

  const canCancel =
    reg.status !== "cancelled" && new Date(event.start_time).getTime() > Date.now();

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/events/${event.id}`}
            className="font-bold text-navy hover:text-brand"
          >
            {event.title}
          </Link>
          {event.fests && <p className="text-xs text-slate-500">{event.fests.title}</p>}
        </div>
        <StatusBadge status={reg.status} />
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
        <p className="flex items-center gap-2">
          <CalendarDays size={14} className="shrink-0" />
          {formatDateTime(event.start_time)}
        </p>
        {event.venue && (
          <p className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0" />
            {event.venue}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-start gap-3">
        <Link
          href={`/confirmation/${reg.id}`}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {reg.status === "confirmed" ? "View ticket" : "View details"}
        </Link>
        {canCancel && <CancelButton registrationId={reg.id} />}
      </div>
    </li>
  );
}

function Section({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: RegistrationWithEvent[];
  emptyText?: string;
}) {
  if (items.length === 0 && !emptyText) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-navy">
        {title} ({items.length})
      </h2>
      {items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          {emptyText}
        </p>
      ) : (
        <ul className="mt-3 grid gap-4 md:grid-cols-2">
          {items.map((r) => (
            <Row key={r.id} reg={r} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function RegistrationList({
  registrations,
}: {
  registrations: RegistrationWithEvent[];
}) {
  const now = Date.now();
  const upcoming: RegistrationWithEvent[] = [];
  const past: RegistrationWithEvent[] = [];
  const cancelled: RegistrationWithEvent[] = [];

  registrations.forEach((r) => {
    if (!r.events) return;
    if (r.status === "cancelled") cancelled.push(r);
    else if (new Date(r.events.end_time).getTime() < now) past.push(r);
    else upcoming.push(r);
  });

  upcoming.sort(
    (a, b) =>
      new Date(a.events!.start_time).getTime() - new Date(b.events!.start_time).getTime()
  );

  return (
    <div>
      <Section
        title="Upcoming"
        items={upcoming}
        emptyText="You have no upcoming registrations. Browse events and join one!"
      />
      <Section title="Past events" items={past} />
      <Section title="Cancelled" items={cancelled} />
    </div>
  );
}