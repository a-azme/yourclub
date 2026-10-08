import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getMyRegistrations } from "@/lib/registration-queries";
import RegistrationList from "@/components/registration/RegistrationList";

export const metadata: Metadata = { title: "My Registrations - YourClub" };
export const dynamic = "force-dynamic";

export default async function MyRegistrationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/my-registrations");

  const registrations = await getMyRegistrations(user.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">My Registrations</h1>
      <p className="mt-1 text-slate-600">View your tickets and manage your registrations.</p>

      {registrations.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-slate-500">You have not registered for any event yet.</p>
          <Link
            href="/events"
            className="mt-4 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Browse events
          </Link>
        </div>
      ) : (
        <RegistrationList registrations={registrations} />
      )}
    </div>
  );
}
