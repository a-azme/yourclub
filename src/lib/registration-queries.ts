import { createClient } from "@/lib/supabase/server";
import type { EventItem, Registration } from "@/types";

export type RegistrationWithEvent = Registration & {
  events:
    | (EventItem & { fests: { id: string; title: string } | null })
    | null;
};

const SELECT = "*, events(*, fests(id, title))";

/** Row Level Security makes sure a normal user can only read their own rows. */
export async function getRegistration(id: string): Promise<RegistrationWithEvent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getRegistration:", error.message);
    return null;
  }
  return (data as unknown as RegistrationWithEvent) ?? null;
}

export async function getMyRegistrations(userId: string): Promise<RegistrationWithEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyRegistrations:", error.message);
    return [];
  }
  return (data ?? []) as unknown as RegistrationWithEvent[];
}