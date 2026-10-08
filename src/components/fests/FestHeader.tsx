import Link from "next/link";
import { Building2, CalendarDays, ChevronLeft, MapPin } from "lucide-react";
import {
  FEST_STATUS_LABELS,
  FEST_STATUS_STYLES,
  dayOnly,
  festGradient,
  getFestStatus,
} from "@/lib/fest-status";
import { formatDateRange } from "@/lib/utils";
import type { FestWithOrg } from "@/lib/queries";

export default function FestHeader({ fest, eventCount }: { fest: FestWithOrg; eventCount: number }) {
  const status = getFestStatus(fest.start_date, fest.end_date);

  return (
    <section
      className={`relative bg-gradient-to-br ${festGradient(fest.id)} bg-cover bg-center`}
      style={fest.image_url ? { backgroundImage: `url(${fest.image_url})` } : undefined}
    >
      <div className="absolute inset-0 bg-navy/60" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 text-white sm:px-6">
        <Link
          href="/fests"
          className="mb-4 inline-flex items-center gap-1 text-sm text-blue-100 hover:text-white"
        >
          <ChevronLeft size={16} /> All fests
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold sm:text-4xl">{fest.title}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${FEST_STATUS_STYLES[status]}`}>
            {FEST_STATUS_LABELS[status]}
          </span>
        </div>
        {fest.tagline && <p className="mt-2 text-lg text-blue-100">{fest.tagline}</p>}

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-2">
            <CalendarDays size={16} /> {formatDateRange(dayOnly(fest.start_date), dayOnly(fest.end_date))}
          </span>
          {fest.venue && (
            <span className="flex items-center gap-2">
              <MapPin size={16} /> {fest.venue}
            </span>
          )}
          <span className="flex items-center gap-2">
            <Building2 size={16} /> {fest.organizations?.name ?? "Organizer"}
          </span>
          <span>{eventCount} event{eventCount === 1 ? "" : "s"}</span>
        </div>
      </div>
    </section>
  );
}