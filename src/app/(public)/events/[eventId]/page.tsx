import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEvent, getEventStats } from "@/lib/queries";
import { getRegState } from "@/lib/registration";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/constants";
import EventDetails from "@/components/events/EventDetails";
import CapacityBar from "@/components/events/CapacityBar";
import Countdown from "@/components/events/Countdown";
import { RegistrationForm } from "@/components/registration/RegistrationForm";
import type { Profile, RegistrationStatus } from "@/types";

export default async function EventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const event = await getEvent(eventId);
  if (!event) notFound();

  const statsMap = await getEventStats([event.id]);
  const stats = statsMap[event.id] ?? null;
  const state = getRegState(event, stats);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let existing: { id: string; status: RegistrationStatus } | null = null;

  if (user) {
    const [profileRes, regRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("registrations")
        .select("id, status")
        .eq("event_id", event.id)
        .eq("user_id", user.id)
        .neq("status", "cancelled")
        .maybeSingle(),
    ]);
    profile = (profileRes.data as Profile | null) ?? null;
    existing = (regRes.data as { id: string; status: RegistrationStatus } | null) ?? null;
  }

  const next = encodeURIComponent(`/events/${event.id}`);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <EventDetails event={event} />

        <aside className="h-fit space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <CapacityBar
            registered={stats?.registered_count ?? 0}
            capacity={event.capacity}
          />
          {state !== "closed" && (
            <Countdown target={event.registration_deadline} />
          )}

          {existing ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-navy">You are registered</p>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[existing.status]}`}
              >
                {STATUS_LABELS[existing.status]}
              </span>
              <Link
                href={`/confirmation/${existing.id}`}
                className="block rounded-lg bg-brand py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark"
              >
                View confirmation
              </Link>
            </div>
          ) : state === "closed" ? (
            <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
              Registration for this event is closed.
            </p>
          ) : !user ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Log in to register for this event.</p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href={`/login?next=${next}`}
                  className="rounded-lg border border-slate-300 py-2.5 text-center text-sm font-semibold text-navy hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-brand py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark"
                >
                  Sign Up
                </Link>
              </div>
            </div>

          ) : (
            <>
              {(!profile?.student_id || !profile?.phone) && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Tip: save your details once in{" "}
                  <Link href="/profile" className="font-semibold underline">
                    your profile
                  </Link>{" "}
                  to auto-fill this form.
                </p>
              )}
              <RegistrationForm
                eventId={event.id}
                isFull={state === "full"}
                initial={{
                  fullName: profile?.full_name ?? "",
                  email: user.email ?? profile?.email ?? "",
                  phone: profile?.phone ?? "",
                  studentId: profile?.student_id ?? "",
                  department: profile?.department ?? "",
                }}
              />
            </>
          )}








        </aside>
      </div>
    </div>
  );
}