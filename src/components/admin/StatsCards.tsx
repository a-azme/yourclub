import type { LucideIcon } from "lucide-react";

export type StatItem = {
  label: string;
  value: number | string;
  icon: LucideIcon;
};

export default function StatsCards({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((s) => (
        <div
          key={s.label}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand">
            <s.icon size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-xl font-bold text-navy">{s.value}</p>
            <p className="truncate text-xs text-slate-500">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}