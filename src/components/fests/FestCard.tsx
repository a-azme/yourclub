import Link from "next/link";
import { CalendarDays, Users } from "lucide-react";
import { formatDateRange } from "@/lib/utils";
import type { FestWithOrg } from "@/lib/queries";

const GRADIENTS = [
  "from-[#06173d] via-[#0b2f7a] to-[#1450c8]",
  "from-[#12355b] via-[#3f6c9a] to-[#9fc3e6]",
  "from-[#2b2350] via-[#8a4f6b] to-[#e9965a]",
  "from-[#0f3d2e] via-[#17785a] to-[#4cc9a0]",
  "from-[#3a1456] via-[#6b2fa0] to-[#b57be8]",
];

function gradientFor(id: string) {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return GRADIENTS[sum % GRADIENTS.length];
}

function getStatus(start: string, end: string) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
  if (today < start) return { text: "Upcoming", style: "bg-blue-50 text-brand" };
  if (today > end) return { text: "Ended", style: "bg-slate-100 text-slate-600" };
  return { text: "Live now", style: "bg-green-50 text-green-700" };
}

export default function FestCard({ fest }: { fest: FestWithOrg }) {
  const status = getStatus(fest.start_date, fest.end_date);

  return (
    <Link
      href={`/fests/${fest.id}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`flex h-32 flex-col justify-center bg-gradient-to-br ${gradientFor(fest.id)} bg-cover bg-center px-6 text-white`}
        style={fest.image_url ? { backgroundImage: `url(${fest.image_url})` } : undefined}
      >
        <h3 className="text-xl font-bold">{fest.title}</h3>
        {fest.tagline && <p className="mt-1 text-sm text-white/80">{fest.tagline}</p>}
      </div>
      <div className="p-4">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays size={14} />
          {formatDateRange(fest.start_date, fest.end_date)}
        </p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <div>
            <h4 className="font-semibold text-navy group-hover:text-brand">{fest.title}</h4>
            {fest.organizations && (
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <Users size={14} />
                {fest.organizations.name}
              </p>
            )}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.style}`}>
            {status.text}
          </span>
        </div>
      </div>
    </Link>
  );
}