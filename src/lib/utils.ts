import { clsx, type ClassValue } from "clsx";
import { format, isSameMonth, isSameYear } from "date-fns";

const TIME_ZONE = "Asia/Dhaka";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Only allow same-site relative redirects (prevents open redirects). */
export function safeRedirect(next: string | null | undefined, fallback = "/") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

/** Formats a date-only string (YYYY-MM-DD) range, e.g. "Nov 12 - 14, 2026". */
export function formatDateRange(start: string, end: string) {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (start === end) return format(s, "MMM d, yyyy");
  if (isSameMonth(s, e)) return `${format(s, "MMM d")} - ${format(e, "d, yyyy")}`;
  if (isSameYear(s, e)) return `${format(s, "MMM d")} - ${format(e, "MMM d, yyyy")}`;
  return `${format(s, "MMM d, yyyy")} - ${format(e, "MMM d, yyyy")}`;
}

/** Date/time helpers pinned to Asia/Dhaka so server and browser always match. */
export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}