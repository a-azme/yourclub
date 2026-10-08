'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, LayoutGrid, Search } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

type FestOption = { id: string; title: string };

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [fest, setFest] = useState('');
  const [fests, setFests] = useState<FestOption[]>([]);

  useEffect(() => {
    let active = true;
    createClient()
      .from('fests')
      .select('id, title')
      .order('start_date', { ascending: true })
      .then(({ data }) => {
        if (active && data) setFests(data as FestOption[]);
      });
    return () => {
      active = false;
    };
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (category) p.set('category', category);
    if (fest) p.set('fest', fest);
    const qs = p.toString();
    router.push(qs ? `/events?${qs}` : '/events');
  }

  const field = 'flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-slate-600';
  return (
    <form onSubmit={submit} className="grid gap-2 rounded-xl bg-white/80 p-2 shadow-lg shadow-blue-900/5 ring-1 ring-slate-200 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
      <label className={field}>
        <Search size={18} className="text-slate-400" aria-hidden="true" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events..."
          aria-label="Search events"
          className="w-full bg-transparent outline-none placeholder:text-slate-400"
        />
      </label>
      <label className={field}>
        <CalendarDays size={18} className="text-slate-400" aria-hidden="true" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category"
          className="w-full bg-transparent outline-none"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className={field}>
        <LayoutGrid size={18} className="text-slate-400" aria-hidden="true" />
        <select
          value={fest}
          onChange={(e) => setFest(e.target.value)}
          aria-label="Fest"
          className="w-full bg-transparent outline-none"
        >
          <option value="">All Fests</option>
          {fests.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
        </select>
      </label>
      <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
        <Search size={18} aria-hidden="true" /> Search
      </button>
    </form>
  );
}