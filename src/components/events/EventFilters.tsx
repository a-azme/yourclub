"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

type Props = {
  fests: { id: string; title: string }[];
  q?: string;
  category?: string;
  fest?: string;
  sort?: string;
};

type Values = {
  q: string;
  category: string;
  fest: string;
  sort: string;
};

const selectClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

export default function EventFilters({
  fests,
  q = "",
  category = "",
  fest = "",
  sort = "",
}: Props) {
  const router = useRouter();
  const [term, setTerm] = useState(q);

  function apply(next: Partial<Values>) {
    const merged: Values = { q: term.trim(), category, fest, sort, ...next };
    const params = new URLSearchParams();
    (Object.entries(merged) as [string, string][]).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const qs = params.toString();
    router.push(qs ? `/events?${qs}` : "/events");
  }

  function clearAll() {
    setTerm("");
    router.push("/events");
  }

  const hasFilters = Boolean(q || category || fest || sort);

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q: term.trim() });
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search by title, venue or description"
            aria-label="Search events"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => apply({ category: e.target.value })}
          className={selectClass}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          aria-label="Fest"
          value={fest}
          onChange={(e) => apply({ fest: e.target.value })}
          className={selectClass}
        >
          <option value="">All fests</option>
          {fests.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
            </option>
          ))}
        </select>

        <select
          aria-label="Sort by"
          value={sort}
          onChange={(e) => apply({ sort: e.target.value })}
          className={selectClass}
        >
          <option value="">Soonest first</option>
          <option value="deadline">Deadline soonest</option>
          <option value="latest">Latest first</option>
        </select>

        {hasFilters && (
          <Button type="button" variant="outline" onClick={clearAll}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}