import type { RegistrationStatus } from "@/types";

type Point = { label: string; value: number };

export function TrendChart({ title, data }: { title: string; data: Point[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-bold text-navy">{title}</h2>
        <span className="text-xs text-slate-500">{total} in total</span>
      </div>

      <div
        className="mt-5 flex items-end gap-1.5 sm:gap-2"
        role="img"
        aria-label={`${title}: ${total} registrations`}
      >
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center justify-end">
            <span className="mb-1 text-[10px] font-semibold text-slate-600">
              {d.value > 0 ? d.value : ""}
            </span>
            <div
              className="w-full rounded-t bg-brand"
              style={{ height: `${Math.max(d.value > 0 ? 6 : 2, Math.round((d.value / max) * 128))}px` }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={`flex-1 text-center text-[10px] text-slate-500 ${i % 2 ? "hidden sm:block" : ""}`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const BAR_COLORS: Record<RegistrationStatus, string> = {
  confirmed: "bg-green-500",
  pending: "bg-amber-500",
  waitlisted: "bg-slate-400",
  cancelled: "bg-red-500",
};

const LABELS: Record<RegistrationStatus, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  waitlisted: "Waitlisted",
  cancelled: "Cancelled",
};

export function StatusBreakdown({ counts }: { counts: Record<RegistrationStatus, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const order: RegistrationStatus[] = ["confirmed", "pending", "waitlisted", "cancelled"];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-navy">Registrations by status</h2>
      <ul className="mt-4 space-y-3">
        {order.map((s) => {
          const pct = total > 0 ? Math.round((counts[s] / total) * 100) : 0;
          return (
            <li key={s}>
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-600">{LABELS[s]}</span>
                <span className="font-semibold text-navy">
                  {counts[s]} ({pct}%)
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${BAR_COLORS[s]}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}