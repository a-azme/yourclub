import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import CategoryBadge from "@/components/events/CategoryBadge";
import CapacityBar from "@/components/events/CapacityBar";
import { getRegState } from "@/lib/registration";
import { formatDateTime } from "@/lib/utils";
import type { EventWithFest } from "@/lib/queries";

type Props = {
  event: EventWithFest;
  registered?: number;
};

export default function EventCard({ event, registered = 0 }: Props) {
  const state = getRegState(event, { registered_count: registered });

  const badge =
    state === "closed"
      ? { text: "Closed", style: "bg-slate-100 text-slate-600" }
      : state === "full"
        ? { text: "Waitlist", style: "bg-amber-50 text-amber-700" }
        : { text: "Open", style: "bg-green-50 text-green-700" };

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <CategoryBadge category={event.category} />
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.style}`}>
          {badge.text}
        </span>
      </div>

      <h3 className="mt-3 text-base font-bold text-navy group-hover:text-brand">
        {event.title}
      </h3>
      {event.fests && (
        <p className="mt-0.5 text-xs text-slate-500">{event.fests.title}</p>
      )}

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

      <CapacityBar
        registered={registered}
        capacity={event.capacity}
        className="mt-4"
      />
    </Link>
  );
}