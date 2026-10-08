import { createClient } from "@/lib/supabase/server";
import type { Organization } from "@/types";

export async function getOrganizations(): Promise<Pick<Organization, "id" | "name">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) {
    console.error("getOrganizations:", error.message);
    return [];
  }
  return data ?? [];
}