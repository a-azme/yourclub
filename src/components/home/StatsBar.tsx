import { CalendarDays, Star, Ticket, Users } from 'lucide-react';
import { EVENTS, FESTS, ORGANIZATIONS } from '@/lib/data';

export default function StatsBar() {
  const participants = EVENTS.reduce((s, e) => s + e.registered, 0);
  const stats = [
    { Icon: CalendarDays, value: FESTS.filter((f) => f.status === 'Upcoming').length, label: 'Upcoming Fests' },
    { Icon: Ticket, value: EVENTS.length, label: 'Total Events' },
    { Icon: Users, value: `${participants}+`, label: 'Registered Participants' },
    { Icon: Star, value: ORGANIZATIONS.length, label: 'Active Organizations' },
  ];
  return (
    <section className="bg-soft">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-7 sm:px-6 lg:grid-cols-4">
        {stats.map(({ Icon, value, label }) => (
          <div key={label} className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-brand"><Icon size={22} /></span>
            <div>
              <p className="text-xl font-bold text-navy">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}