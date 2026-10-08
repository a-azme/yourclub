import Link from 'next/link';
import { format } from 'date-fns';
import { CalendarDays, ChevronRight } from 'lucide-react';
import CategoryBadge from '@/components/events/CategoryBadge';
import { SectionHeader } from './UpcomingFests';
import { CATEGORY_STYLES } from '@/lib/constants';
import { EVENTS } from '@/lib/data';

export default function FeaturedEvents() {
  const featured = EVENTS.filter((e) => e.featured).slice(0, 3);
  return (
    <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6">
      <SectionHeader title="Featured Events" href="/events" />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((e) => {
          const { Icon } = CATEGORY_STYLES[e.category];
          return (
            <Link key={e.id} href={`/events/${e.id}`} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-brand"><Icon size={28} /></span>
              <div className="min-w-0 flex-1">
                <CategoryBadge category={e.category} />
                <h3 className="mt-1 truncate font-semibold text-navy">{e.title}</h3>
                <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays size={13} />{format(new Date(e.start), 'MMM d, yyyy  •  hh:mm a')}
                </p>
              </div>
              <ChevronRight className="shrink-0 text-slate-400" size={20} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}