import type { EventItem, EventStats } from "@/types";

export type RegState = "open" | "full" | "closed";

/** closed = deadline passed, full = no seats left (waitlist only), open = seats available. */
export function getRegState(
  event: Pick<EventItem, "capacity" | "registration_deadline">,
  stats?: Pick<EventStats, "registered_count"> | null
): RegState {
  if (new Date(event.registration_deadline).getTime() < Date.now()) return "closed";
  const registered = stats?.registered_count ?? 0;
  if (registered >= event.capacity) return "full";
  return "open";
}