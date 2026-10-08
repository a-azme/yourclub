import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getRegistration } from "@/lib/registration-queries";
import ConfirmationCard from "@/components/registration/ConfirmationCard";

export const metadata: Metadata = { title: "Registration - YourClub" };
export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ regId: string }>;
}) {
  const { regId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/confirmation/${regId}`)}`);

  const registration = await getRegistration(regId);
  if (!registration || !registration.events) notFound();

  const canCancel =
    registration.status !== "cancelled" &&
    new Date(registration.events.start_time).getTime() > Date.now();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ConfirmationCard
        registration={{ ...registration, events: registration.events }}
        canCancel={canCancel}
      />
    </div>
  );
}