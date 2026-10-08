import Link from "next/link";
import { Search } from "lucide-react";

const field =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-blue-100";

export default function FestFilters({ q, status }: { q?: string; status?: string }) {
  return (
    <form method="get" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search fests"
            aria-label="Search fests"
            className={`${field} pl-9`}
          />
        </div>

        <select name="status" defaultValue={status ?? "all"} aria-label="Fest status" className={field}>
          <option value="all">All fests</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="ended">Ended</option>
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Search
          </button>
          <Link
            href="/fests"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}