import { NextResponse } from "next/server";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/utils";
import type { Registration } from "@/types";

export const dynamic = "force-dynamic";

const text = (v: unknown) => (typeof v === "string" ? v : "");

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as Registration[];
  const csv = Papa.unparse(
    {
      fields: [
        "Name",
        "Email",
        "Phone",
        "Student ID",
        "Class / Department",
        "Status",
        "Checked in",
        "Team name",
        "Notes",
        "Registered at",
      ],
      data: rows.map((r) => [
        r.full_name,
        r.email,
        r.phone ?? "",
        r.student_id ?? "",
        r.department ?? "",
        r.status,
        r.checked_in ? "Yes" : "No",
        text(r.extra?.team_name),
        text(r.extra?.notes),
        formatDateTime(r.created_at),
      ]),
    },
    { escapeFormulae: true }
  );

  const slug =
    event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event";

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-participants.csv"`,
    },
  });
}