export type FestStatus = "upcoming" | "ongoing" | "ended";

export const FEST_STATUS_LABELS: Record<FestStatus, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  ended: "Ended",
};

export const FEST_STATUS_STYLES: Record<FestStatus, string> = {
  upcoming: "bg-blue-50 text-blue-700",
  ongoing: "bg-green-50 text-green-700",
  ended: "bg-slate-100 text-slate-600",
};

const GRADIENTS = [
  "from-[#06173d] via-[#0b2f7a] to-[#1450c8]",
  "from-[#12355b] via-[#3f6c9a] to-[#9fc3e6]",
  "from-[#2b2350] via-[#8a4f6b] to-[#e9965a]",
  "from-[#0f3d2e] via-[#17785a] to-[#4cc9a0]",
  "from-[#3a1456] via-[#6b2fa0] to-[#b57be8]",
];

/** Keeps only YYYY-MM-DD so both date and timestamp columns work. */
export function dayOnly(value: string) {
  return value.slice(0, 10);
}

export function getFestStatus(start: string, end: string, now = new Date()): FestStatus {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(now);
  if (today < dayOnly(start)) return "upcoming";
  if (today > dayOnly(end)) return "ended";
  return "ongoing";
}

export function festGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}