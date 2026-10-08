import Link from "next/link";
import { CalendarDays, Clock, MapPin, Ticket } from "lucide-react";
import CategoryBadge from "@/components/events/CategoryBadge";
import { formatDate, formatDateTime, formatTime } from "@/lib/utils";
import type { EventWithFest } from "@/lib/queries";

export default function EventDetails({ event }: { event: EventWithFest }) {
  const rows = [
    {
      icon: CalendarDays,
      label: "Date",
      value: formatDate(event.start_time),
    },
    {
      icon: Clock,
      label: "Time",
      value: `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`,
    },
    {
      icon: MapPin,
      label: "Venue",
      value: event.venue ?? "To be announced",
    },
    {
      icon: Ticket,
      label: "Fee",
      value: event.fee > 0 ? `৳${event.fee}` : "Free",
    },
  ];

  return (
    <div>
      <CategoryBadge category={event.category} />
      <h1 className="mt-3 text-3xl font-bold text-navy">{event.title}</h1>
      {event.fests && (
        <p className="mt-1 text-sm text-slate-500">
          Part of{" "}
          <Link href={`/fests/${event.fests.id}`} className="font-semibold text-brand hover:underline">
            {event.fests.title}
          </Link>
        </p>
      )}

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
            <r.icon size={18} className="mt-0.5 shrink-0 text-brand" />
            <div>
              <dt className="text-xs font-medium text-slate-500">{r.label}</dt>
              <dd className="text-sm font-semibold text-navy">{r.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs text-slate-500">
        Registration deadline: {formatDateTime(event.registration_deadline)}
      </p>

      {event.description && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-navy">About this event</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
            {event.description}
          </p>
        </div>
      )}
    </div>
  );
}