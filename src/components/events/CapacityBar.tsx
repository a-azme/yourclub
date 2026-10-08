import { cn } from "@/lib/utils";

type Props = {
  registered: number;
  capacity: number;
  className?: string;
};

export default function CapacityBar({ registered, capacity, className }: Props) {
  const pct = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;
  const left = Math.max(0, capacity - registered);
  const full = left === 0;
  const low = !full && pct >= 80;

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">
          {registered} / {capacity} registered
        </span>
        <span
          className={cn(
            "font-semibold",
            full ? "text-red-600" : low ? "text-amber-600" : "text-green-700"
          )}
        >
          {full ? "Full" : `${left} seats left`}
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Seats filled"
      >
        <div
          className={cn(
            "h-full rounded-full",
            full ? "bg-red-500" : low ? "bg-amber-500" : "bg-brand"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}