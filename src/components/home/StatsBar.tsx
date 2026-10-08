import { Building2, CalendarDays, Ticket, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { SiteStats } from "@/types";

export async function StatsBar() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_stats").select("*").single<SiteStats>();

  const items = [
    { icon: CalendarDays, value: data?.upcoming_fests ?? 0, label: "Upcoming fests" },
    { icon: Ticket, value: data?.total_events ?? 0, label: "Events" },
    { icon: Users, value: data?.registered_participants ?? 0, label: "Registrations" },
    { icon: Building2, value: data?.active_organizations ?? 0, label: "Active clubs" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6" aria-label="Site statistics">
      <dl className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
              <item.icon size={22} aria-hidden="true" />
            </span>
            <div>
              <dd className="text-xl font-bold text-navy">{item.value}</dd>
              <dt className="text-xs text-slate-500">{item.label}</dt>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default StatsBar;