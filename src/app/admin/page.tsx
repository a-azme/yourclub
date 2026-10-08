import Link from "next/link";
import {
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock,
  Layers,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getEvents, getEventStats } from "@/lib/queries";
import StatsCards from "@/components/admin/StatsCards";
import { StatusBreakdown, TrendChart } from "@/components/admin/Charts";
import CapacityBar from "@/components/events/CapacityBar";
import type { RegistrationStatus } from "@/types";

export const dynamic = "force-dynamic";

const TZ = "Asia/Dhaka";

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [regsRes, eventsCountRes, festsCountRes, usersCountRes, events] = await Promise.all([
    supabase.from("registrations").select("status, checked_in, created_at").limit(5000),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("fests").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
    getEvents(),
  ]);
  const stats = await getEventStats(events.map((e) => e.id));

  const regs = (regsRes.data ?? []) as {
    status: RegistrationStatus;
    checked_in: boolean;
    created_at: string;
  }[];

  const counts: Record<RegistrationStatus, number> = {
    pending: 0,
    confirmed: 0,
    waitlisted: 0,
    cancelled: 0,
  };
  let checkedIn = 0;
  regs.forEach((r) => {
    counts[r.status] += 1;
    if (r.checked_in) checkedIn += 1;
  });
  const active = counts.pending + counts.confirmed + counts.waitlisted;

  // Registrations per day for the last 14 days (Asia/Dhaka)
  const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });
  const labelFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric" });
  const buckets = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86_400_000);
    return { key: keyFmt.format(d), label: labelFmt.format(d), value: 0 };
  });
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  regs.forEach((r) => {
    const bucket = byKey.get(keyFmt.format(new Date(r.created_at)));
    if (bucket) bucket.value += 1;
  });

  const top = [...events]
    .sort(
      (a, b) =>
        (stats[b.id]?.registered_count ?? 0) - (stats[a.id]?.registered_count ?? 0)
    )
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
          <p className="mt-1 text-slate-600">Overview of all fests, events and registrations.</p>
        </div>
        <Link
          href="/admin/events"
          className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Manage participants
        </Link>
      </div>

      <div className="mt-6">
        <StatsCards
          items={[
            { label: "Total users", value: usersCountRes.count ?? 0, icon: UserPlus },
            { label: "Events", value: eventsCountRes.count ?? events.length, icon: CalendarDays },
            { label: "Fests", value: festsCountRes.count ?? 0, icon: Layers },
            { label: "Active registrations", value: active, icon: Users },
            { label: "Confirmed", value: counts.confirmed, icon: CircleCheck },
            { label: "Waitlisted", value: counts.waitlisted, icon: Clock },
            { label: "Cancelled", value: counts.cancelled, icon: CircleX },
            { label: "Checked in", value: checkedIn, icon: UserCheck },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TrendChart title="Registration trend (last 14 days)" data={buckets} />
        <StatusBreakdown counts={counts} />
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-navy">Most popular events</h2>
        {top.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No events yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {top.map((e) => (
              <li
                key={e.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <Link
                  href={`/admin/events/${e.id}/participants`}
                  className="font-semibold text-navy hover:text-brand"
                >
                  {e.title}
                </Link>
                <CapacityBar
                  className="w-full sm:w-64"
                  registered={stats[e.id]?.registered_count ?? 0}
                  capacity={e.capacity}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}