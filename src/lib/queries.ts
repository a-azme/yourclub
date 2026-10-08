import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";
import { getFestStatus, type FestStatus } from "@/lib/fest-status";
import type { EventCategory, EventItem, EventStats, Fest, Organization } from "@/types";

export type FestWithOrg = Fest & {
  organizations: Pick<Organization, "id" | "name"> | null;
};

export type EventWithFest = EventItem & {
  fests: { id: string; title: string } | null;
};

function clean(term: string) {
  return term.replace(/[%,()*\\]/g, " ").replace(/\s+/g, " ").trim();
}

export type FestFilterInput = {
  q?: string;
  status?: string;
};

export async function getFests(filters: FestFilterInput = {}): Promise<FestWithOrg[]> {
  const supabase = await createClient();
  let query = supabase
    .from("fests")
    .select("*, organizations(id, name)")
    .order("start_date", { ascending: true });

  const term = filters.q ? clean(filters.q) : "";
  if (term) query = query.or(`title.ilike.%${term}%,tagline.ilike.%${term}%`);

  const { data, error } = await query;
  if (error) {
    console.error("getFests:", error.message);
    return [];
  }

  let fests = (data ?? []) as unknown as FestWithOrg[];
  const status = filters.status as FestStatus | "all" | undefined;
  if (status && status !== "all") {
    fests = fests.filter((f) => getFestStatus(f.start_date, f.end_date) === status);
  }
  return fests;
}

export async function getFest(id: string): Promise<FestWithOrg | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fests")
    .select("*, organizations(id, name)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getFest:", error.message);
    return null;
  }
  return (data as unknown as FestWithOrg) ?? null;
}

export type EventFilterInput = {
  q?: string;
  category?: string;
  fest?: string;
  sort?: string;
};

export async function getEvents(filters: EventFilterInput = {}): Promise<EventWithFest[]> {
  const supabase = await createClient();
  let query = supabase.from("events").select("*, fests(id, title)");

  const term = filters.q ? clean(filters.q) : "";
  if (term) {
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%,venue.ilike.%${term}%`);
  }
  if (filters.category && CATEGORIES.includes(filters.category as EventCategory)) {
    query = query.eq("category", filters.category);
  }
  if (filters.fest) query = query.eq("fest_id", filters.fest);

  if (filters.sort === "deadline") {
    query = query.order("registration_deadline", { ascending: true });
  } else if (filters.sort === "latest") {
    query = query.order("start_time", { ascending: false });
  } else {
    query = query.order("start_time", { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    console.error("getEvents:", error.message);
    return [];
  }
  return (data ?? []) as unknown as EventWithFest[];
}

export async function getEvent(id: string): Promise<EventWithFest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, fests(id, title)")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error("getEvent:", error.message);
    return null;
  }
  return (data as unknown as EventWithFest) ?? null;
}

export async function getEventStats(ids: string[]): Promise<Record<string, EventStats>> {
  const map: Record<string, EventStats> = {};
  if (ids.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase.from("event_counts").select("*").in("event_id", ids);
  if (error) {
    console.error("getEventStats:", error.message);
    return map;
  }
  ((data ?? []) as EventStats[]).forEach((row) => {
    map[row.event_id] = row;
  });
  return map;
}