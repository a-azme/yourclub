'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, LayoutGrid, Search } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { FESTS } from '@/lib/data';

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [fest, setFest] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (category) p.set('category', category);
    if (fest) p.set('fest', fest);
    router.push(`/events?${p.toString()}`);
  }

  const field = 'flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm text-slate-600';
  return (
    <form onSubmit={submit} className="grid gap-2 rounded-xl bg-white/80 p-2 shadow-lg shadow-blue-900/5 ring-1 ring-slate-200 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
      <label className={field}>
        <Search size={18} className="text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events, fests..." className="w-full bg-transparent outline-none placeholder:text-slate-400" />
      </label>
      <label className={field}>
        <CalendarDays size={18} className="text-slate-400" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-transparent outline-none">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <label className={field}>
        <LayoutGrid size={18} className="text-slate-400" />
        <select value={fest} onChange={(e) => setFest(e.target.value)} className="w-full bg-transparent outline-none">
          <option value="">All Fests</option>
          {FESTS.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
        </select>
      </label>
      <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
        <Search size={18} /> Search
      </button>
    </form>
  );
}