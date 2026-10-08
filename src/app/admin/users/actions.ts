"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  // 1. The caller must be a signed-in admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are not signed in." };

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") return { error: "Only admins can delete users." };

  // 2. Safety rules
  if (userId === user.id) return { error: "You cannot delete your own account." };

  const { data: target } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (target?.role === "admin") {
    return { error: "Admins cannot be deleted here. Change their role to user first." };
  }

  // 3. Delete the auth account (needs the service-role key)
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local and restart the server." };
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  // If the profile row was not removed by a cascade, remove it now
  await admin.from("profiles").delete().eq("id", userId);

  revalidatePath("/admin/users");
  return {};
}