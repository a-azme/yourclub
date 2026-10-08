import Link from "next/link";
import { Building2, CalendarDays, MapPin } from "lucide-react";
import {
  FEST_STATUS_LABELS,
  FEST_STATUS_STYLES,
  dayOnly,
  festGradient,
  getFestStatus,
} from "@/lib/fest-status";
import { formatDateRange } from "@/lib/utils";
import type { FestWithOrg } from "@/lib/queries";

export default function FestListCard({ fest, eventCount }: { fest: FestWithOrg; eventCount?: number }) {
  const status = getFestStatus(fest.start_date, fest.end_date);

  return (
    <Link
      href={`/fests/${fest.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`relative flex h-36 flex-col justify-end bg-gradient-to-br ${festGradient(fest.id)} bg-cover bg-center p-5 text-white`}
        style={fest.image_url ? { backgroundImage: `url(${fest.image_url})` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${FEST_STATUS_STYLES[status]}`}
        >
          {FEST_STATUS_LABELS[status]}
        </span>
        <h3 className="relative text-xl font-bold">{fest.title}</h3>
        {fest.tagline && <p className="relative mt-0.5 text-sm text-white/85">{fest.tagline}</p>}
      </div>

      <div className="space-y-1.5 p-4 text-sm">
        <p className="flex items-center gap-2 text-slate-700">
          <CalendarDays size={15} className="text-brand" />
          {formatDateRange(dayOnly(fest.start_date), dayOnly(fest.end_date))}
        </p>
        {fest.venue && (
          <p className="flex items-center gap-2 text-slate-600">
            <MapPin size={15} className="text-brand" /> {fest.venue}
          </p>
        )}
        <p className="flex items-center gap-2 text-slate-500">
          <Building2 size={15} /> {fest.organizations?.name ?? "Organizer"}
        </p>
        {typeof eventCount === "number" && (
          <p className="pt-1 text-xs font-medium text-brand group-hover:underline">
            {eventCount} event{eventCount === 1 ? "" : "s"} →
          </p>
        )}
      </div>
    </Link>
  );
}