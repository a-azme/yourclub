import Link from "next/link";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  EventCategory,
  EventItem,
  Fest,
  Organization,
  SiteStats,
} from "@/types";

/* ---------- Icons (inline SVG) ---------- */
const ICONS = {
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
  ticket: (
    <>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2M13 17v2M13 11v2" />
    </>
  ),
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  cpu: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2" />
    </>
  ),
  bot: (
    <>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4M8 16h.01M16 16h.01" />
    </>
  ),
  gamepad: (
    <>
      <line x1="6" x2="10" y1="12" y2="12" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="15" x2="15.01" y1="13" y2="13" />
      <line x1="18" x2="18.01" y1="11" y2="11" />
      <rect x="2" y="6" width="20" height="12" rx="2" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </>
  ),
  right: <path d="m9 18 6-6-6-6" />,
  arrow: <path d="M5 12h14M12 5l7 7-7 7" />,
} satisfies Record<string, ReactNode>;

type IconName = keyof typeof ICONS;

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

/* ---------- Formatting ---------- */
const TZ = "Asia/Dhaka";
const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: TZ,
});
const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: TZ,
});

function formatRange(start: string, end: string) {
  const s = dateFmt.format(new Date(start));
  const e = dateFmt.format(new Date(end));
  return s === e ? s : `${s} - ${e}`;
}

function festStatus(f: Fest, now: Date) {
  if (new Date(f.end_date) < now) return "Past";
  if (new Date(f.start_date) <= now) return "Ongoing";
  return "Upcoming";
}

const STATUS_STYLE: Record<string, string> = {
  Upcoming: "bg-blue-50 text-blue-700",
  Ongoing: "bg-green-50 text-green-700",
  Past: "bg-slate-100 text-slate-600",
};

const CATEGORIES: EventCategory[] = [
  "Programming",
  "AI & ML",
  "Robotics",
  "Gaming",
  "Workshop",
  "Quiz",
];

const CATEGORY_STYLE: Record<EventCategory, string> = {
  Programming: "bg-blue-50 text-blue-700",
  "AI & ML": "bg-purple-50 text-purple-700",
  Robotics: "bg-green-50 text-green-700",
  Gaming: "bg-rose-50 text-rose-700",
  Workshop: "bg-amber-50 text-amber-700",
  Quiz: "bg-cyan-50 text-cyan-700",
};

const CATEGORY_ICON: Record<EventCategory, IconName> = {
  Programming: "code",
  "AI & ML": "cpu",
  Robotics: "bot",
  Gaming: "gamepad",
  Workshop: "wrench",
  Quiz: "help",
};

/* ---------- Small components ---------- */
function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-navy">{title}</h2>
        <div className="mt-2 h-0.5 w-12 rounded bg-blue-600" />
      </div>
      <Link
        href={href}
        className="flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
      >
        View All <Icon name="arrow" className="h-4 w-4" />
      </Link>
    </div>
  );
}

function FestCard({ fest, orgName, now }: { fest: Fest; orgName?: string; now: Date }) {
  const status = festStatus(fest, now);
  return (
    <Link
      href={`/fests/${fest.id}`}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-md"
    >
      <div
        className="relative flex h-32 flex-col justify-center bg-gradient-to-br from-blue-700 to-navy bg-cover bg-center px-8"
        style={fest.image_url ? { backgroundImage: `url(${fest.image_url})` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/40 to-transparent" />
        <h3 className="relative text-xl font-bold text-white">{fest.title}</h3>
        {fest.tagline && (
          <p className="relative mt-1 line-clamp-1 text-sm text-blue-100">{fest.tagline}</p>
        )}
      </div>
      <div className="p-5">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Icon name="calendar" className="h-3.5 w-3.5" />
          {formatRange(fest.start_date, fest.end_date)}
        </p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h4 className="font-semibold text-navy">{fest.title}</h4>
            {orgName && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <Icon name="users" className="h-3.5 w-3.5" />
                {orgName}
              </p>
            )}
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}
          >
            {status}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EventCard({ event }: { event: EventItem }) {
  const start = new Date(event.start_time);
  const cat = event.category;
  return (
    <Link
      href={`/events/${event.id}`}
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Icon name={CATEGORY_ICON[cat] ?? "calendar"} className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <span
          className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
            CATEGORY_STYLE[cat] ?? "bg-slate-100 text-slate-700"
          }`}
        >
          {cat}
        </span>
        <h3 className="mt-1 truncate font-semibold text-navy">{event.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
          <Icon name="calendar" className="h-3.5 w-3.5" />
          {dateFmt.format(start)} &middot; {timeFmt.format(start)}
        </p>
      </div>
      <Icon name="right" className="h-5 w-5 shrink-0 text-slate-400" />
    </Link>
  );
}

/* ---------- Page ---------- */
export default async function HomePage() {
  const supabase = await createClient();
  const now = new Date();
  const nowIso = now.toISOString();

  // Stats
  const { data: statsRow } = await supabase
    .from("site_stats")
    .select("*")
    .single<SiteStats>();

  // Fests (dropdown ar card duitar jonno ekbar e)
  const { data: festRows } = await supabase
    .from("fests")
    .select("*")
    .order("start_date", { ascending: true });
  const allFests = (festRows ?? []) as Fest[];
  let fests = allFests.filter((f) => new Date(f.end_date) >= now).slice(0, 3);
  let festsUpcoming = true;
  if (fests.length === 0) {
    fests = [...allFests].reverse().slice(0, 3);
    festsUpcoming = false;
  }

  // Organization nam
  const orgMap = new Map<string, string>();
  const orgIds = [...new Set(fests.map((f) => f.organization_id))];
  if (orgIds.length > 0) {
    const { data: orgRows } = await supabase
      .from("organizations")
      .select("id, name")
      .in("id", orgIds);
    ((orgRows ?? []) as Pick<Organization, "id" | "name">[]).forEach((o) =>
      orgMap.set(o.id, o.name)
    );
  }

  // Featured events: upcoming, na thakle latest
  let { data: eventRows } = await supabase
    .from("events")
    .select("*")
    .gte("start_time", nowIso)
    .order("start_time", { ascending: true })
    .limit(3);
  let eventsUpcoming = true;
  if (!eventRows || eventRows.length === 0) {
    const res = await supabase
      .from("events")
      .select("*")
      .order("start_time", { ascending: false })
      .limit(3);
    eventRows = res.data;
    eventsUpcoming = false;
  }
  const events = (eventRows ?? []) as EventItem[];

  const stats: { icon: IconName; value: number | undefined; label: string }[] = [
    { icon: "calendar", value: statsRow?.upcoming_fests, label: "Upcoming Fests" },
    { icon: "ticket", value: statsRow?.total_events, label: "Total Events" },
    { icon: "users", value: statsRow?.registered_participants, label: "Registered Participants" },
    { icon: "star", value: statsRow?.active_organizations, label: "Active Organizations" },
  ];

  const field =
    "w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400";

  return (
    <div>
      {/* Hero (background photo: public/images/hero.jpg) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-200 to-blue-50">
        <div
          className="absolute inset-0 bg-cover bg-right"
          style={{ backgroundImage: "url(/images/hero.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-blue-50/80 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-700">
            Welcome to YourClub
          </p>
          <h1 className="mt-3 text-4xl font-bold text-navy sm:text-5xl">
            Events. Fests. Community.
          </h1>
          <p className="mt-4 max-w-xl text-base text-slate-600">
            Discover exciting fests, explore events, and be a part of something
            bigger. Register, participate and make the most of your club
            experience.
          </p>

          <form
            action="/events"
            method="get"
            className="mt-8 flex max-w-3xl flex-col gap-2 rounded-xl bg-white p-2 shadow-lg sm:flex-row sm:items-center"
          >
            <label className="flex flex-1 items-center gap-3 px-3 py-2">
              <Icon name="search" className="h-4 w-4 shrink-0 text-slate-400" />
              <input name="q" type="text" placeholder="Search events, fests..." className={field} />
            </label>
            <label className="flex items-center gap-3 border-slate-200 px-3 py-2 sm:w-48 sm:border-l">
              <Icon name="calendar" className="h-4 w-4 shrink-0 text-slate-400" />
              <select name="category" defaultValue="" className={field}>
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-3 border-slate-200 px-3 py-2 sm:w-48 sm:border-l">
              <Icon name="grid" className="h-4 w-4 shrink-0 text-slate-400" />
              <select name="fest" defaultValue="" className={field}>
                <option value="">All Fests</option>
                {allFests.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Icon name="search" className="h-4 w-4" /> Search
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-100 bg-blue-50/60">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-6 py-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center gap-4 lg:px-6 ${
                i > 0 ? "lg:border-l lg:border-slate-200" : "lg:pl-0"
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                <Icon name={s.icon} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold leading-tight text-navy">{s.value ?? "-"}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fests */}
      <section className="mx-auto max-w-7xl px-6 pt-12">
        <SectionHeader title={festsUpcoming ? "Upcoming Fests" : "Latest Fests"} href="/fests" />
        {fests.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No fests yet.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fests.map((f) => (
              <FestCard key={f.id} fest={f} orgName={orgMap.get(f.organization_id)} now={now} />
            ))}
          </div>
        )}
      </section>

      {/* Featured events */}
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-12">
        <SectionHeader title={eventsUpcoming ? "Featured Events" : "Latest Events"} href="/events" />
        {events.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No events yet.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}