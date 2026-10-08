import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please log in to register." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const eventId = str(body.eventId);
  const fullName = str(body.fullName);
  const phone = str(body.phone);
  const studentId = str(body.studentId);
  const department = str(body.department);
  const extra =
    body.extra && typeof body.extra === "object" && !Array.isArray(body.extra)
      ? (body.extra as Record<string, unknown>)
      : {};

  if (!eventId) return NextResponse.json({ error: "Event is required." }, { status: 400 });
  if (fullName.length < 3)
    return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  if (!studentId)
    return NextResponse.json({ error: "Student ID is required." }, { status: 400 });
  if (!/^01[3-9]\d{8}$/.test(phone))
    return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });

  const { data: event } = await supabase
    .from("events")
    .select("id, registration_deadline")
    .eq("id", eventId)
    .maybeSingle();

  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  if (new Date(event.registration_deadline).getTime() < Date.now()) {
    return NextResponse.json({ error: "Registration for this event is closed." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .neq("status", "cancelled")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "You are already registered for this event.", id: existing.id },
      { status: 409 }
    );
  }

  // The database decides the real status: "confirmed" if a seat is free, otherwise "waitlisted".
  const { data: created, error } = await supabase
    .from("registrations")
    .insert({
      event_id: eventId,
      user_id: user.id,
      full_name: fullName,
      email: user.email ?? "",
      phone,
      student_id: studentId,
      department: department || null,
      extra,
      status: "confirmed",
    })
    .select("id, status")
    .single();

  if (error || !created) {
    return NextResponse.json(
      { error: error?.message ?? "Could not complete registration." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: created.id, status: created.status }, { status: 201 });
}