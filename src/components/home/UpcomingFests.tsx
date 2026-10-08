import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import FestCard from '@/components/fests/FestCard';
import { FESTS } from '@/lib/data';

export function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h2 className="text-2xl font-bold text-navy">{title}</h2>
        <span className="mt-1 block h-0.5 w-10 rounded bg-brand" />
      </div>
      <Link href={href} className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline">View All <ArrowRight size={16} /></Link>
    </div>
  );
}

export default function UpcomingFests() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <SectionHeader title="Upcoming Fests" href="/fests" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FESTS.slice(0, 3).map((f) => <FestCard key={f.id} fest={f} />)}
      </div>
    </section>
  );
}