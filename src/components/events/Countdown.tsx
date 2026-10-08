"use client";

import { useEffect, useState } from "react";

type Props = {
  target: string;
  label?: string;
};

export default function Countdown({ target, label = "Registration closes in" }: Props) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  // Avoid server/client mismatch: render a placeholder until mounted
  if (now === null) return <div className="h-[72px]" aria-hidden="true" />;

  const diff = new Date(target).getTime() - now;
  if (diff <= 0) {
    return <p className="text-sm font-semibold text-red-600">Registration closed</p>;
  }

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);

  const parts = [
    { value: days, unit: "Days" },
    { value: hours, unit: "Hrs" },
    { value: minutes, unit: "Min" },
    { value: seconds, unit: "Sec" },
  ];

  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <div className="mt-2 grid grid-cols-4 gap-2" role="timer">
        {parts.map((p) => (
          <div key={p.unit} className="rounded-lg bg-brand-light py-2 text-center">
            <div className="text-lg font-bold tabular-nums text-navy">
              {String(p.value).padStart(2, "0")}
            </div>
            <div className="text-[10px] font-semibold uppercase text-slate-500">
              {p.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}