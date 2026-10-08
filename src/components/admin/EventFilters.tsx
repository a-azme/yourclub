"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

type Option = { value: string; label: string };

export default function AdminEventFilters({
  fests,
  categories,
}: {
  fests: Option[];
  categories: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`);
  }

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) setParam("q", q.trim());
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasFilters = ["q", "fest", "category", "status"].some((k) => params.get(k));
  const select =
    "rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand";

  return (
    <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
      <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus-within:border-brand">
        <Search size={16} className="text-slate-400" aria-hidden="true" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search event or venue..."
          className="w-full bg-transparent outline-none placeholder:text-slate-400"
        />
      </label>

      <select aria-label="Fest" className={select} value={params.get("fest") ?? ""} onChange={(e) => setParam("fest", e.target.value)}>
        <option value="">All fests</option>
        {fests.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      <select aria-label="Category" className={select} value={params.get("category") ?? ""} onChange={(e) => setParam("category", e.target.value)}>
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select aria-label="Status" className={select} value={params.get("status") ?? ""} onChange={(e) => setParam("status", e.target.value)}>
        <option value="">Any status</option>
        <option value="open">Seats available</option>
        <option value="full">Full</option>
        <option value="waitlist">Has waitlist</option>
        <option value="upcoming">Upcoming</option>
        <option value="past">Past</option>
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={() => { setQ(""); router.replace(pathname); }}
          className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
        >
          <X size={16} aria-hidden="true" /> Clear
        </button>
      )}
    </div>
  );
}