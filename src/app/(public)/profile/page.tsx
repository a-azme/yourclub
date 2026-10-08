import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/profile/ProfileForm";
import type { Profile } from "@/types";

export const metadata: Metadata = { title: "My Profile - YourClub" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const profile = (data as Profile | null) ?? null;

  const incomplete = !profile?.student_id || !profile?.phone || !profile?.department;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold text-navy">My Profile</h1>
        <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand">
          {profile?.role === "admin" ? "Admin" : "Student"}
        </span>
      </div>
      <p className="mb-6 mt-1 text-slate-600">
        Save your details once and we will pre-fill every event registration form.
      </p>

      {incomplete && (
        <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your profile is incomplete. Add your student ID, mobile number and class to register for events faster.
        </p>
      )}

      <ProfileForm
        userId={user.id}
        email={user.email ?? profile?.email ?? ""}
        initial={{
          fullName: profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "",
          studentId: profile?.student_id ?? "",
          phone: profile?.phone ?? "",
          department: profile?.department ?? "",
        }}
      />
    </div>
  );
}