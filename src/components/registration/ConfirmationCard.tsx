"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { CalendarDays, CalendarPlus, CircleCheck, CircleX, Clock, MapPin } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import CancelButton from "@/components/registration/CancelButton";
import DownloadTicketButton from "@/components/registration/DownloadTicketButton";
import { formatDate, formatTime } from "@/lib/utils";
import type { RegistrationWithEvent } from "@/lib/registration-queries";
import type { EventItem, RegistrationStatus } from "@/types";

type Props = {
  registration: RegistrationWithEvent & { events: NonNullable<RegistrationWithEvent["events"]> };
  canCancel: boolean;
};

const HEAD: Record<
  RegistrationStatus,
  { Icon: typeof CircleCheck; title: string; text: string; tone: string }
> = {
  confirmed: {
    Icon: CircleCheck,
    title: "You are registered!",
    text: "Your seat is confirmed. Show the QR code below at the venue.",
    tone: "bg-green-50 text-green-600",
  },
  waitlisted: {
    Icon: Clock,
    title: "You are on the waitlist",
    text: "This event is full. If a seat opens up, you will be promoted automatically.",
    tone: "bg-amber-50 text-amber-600",
  },
  pending: {
    Icon: Clock,
    title: "Registration received",
    text: "The organizers will confirm your registration soon.",
    tone: "bg-amber-50 text-amber-600",
  },
  cancelled: {
    Icon: CircleX,
    title: "Registration cancelled",
    text: "This registration is no longer active.",
    tone: "bg-red-50 text-red-600",
  },
};

function stamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "");
}

function calendarUrl(event: EventItem, regId: string) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${stamp(event.start_time)}/${stamp(event.end_time)}`,
    details: `Registered via YourClub. Registration ID: ${regId}`,
    location: event.venue ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function ConfirmationCard({ registration, canCancel }: Props) {
  const { events: event } = registration;
  const head = HEAD[registration.status];
  const rows = [
    { label: "Name", value: registration.full_name },
    { label: "Student ID", value: registration.student_id ?? "-" },
    { label: "Class / Department", value: registration.department ?? "-" },
    { label: "Email", value: registration.email },
  ];

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col items-center px-6 pt-8 text-center">
        <span className={`flex h-14 w-14 items-center justify-center rounded-full ${head.tone}`}>
          <head.Icon size={30} />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-navy">{head.title}</h1>
        <p className="mt-1 max-w-md text-sm text-slate-600">{head.text}</p>
        <StatusBadge status={registration.status} className="mt-3" />
      </div>

      <div className="mt-6 border-t border-dashed border-slate-300 px-6 py-6">
        <Link href={`/events/${event.id}`} className="text-lg font-bold text-navy hover:text-brand">
          {event.title}
        </Link>
        {event.fests && <p className="text-sm text-slate-500">{event.fests.title}</p>}

        <div className="mt-3 space-y-1.5 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <CalendarDays size={16} className="text-brand" />
            {formatDate(event.start_time)}, {formatTime(event.start_time)} -{" "}
            {formatTime(event.end_time)}
          </p>
          {event.venue && (
            <p className="flex items-center gap-2">
              <MapPin size={16} className="text-brand" />
              {event.venue}
            </p>
          )}
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-xs font-medium text-slate-500">{r.label}</dt>
              <dd className="break-words text-sm font-semibold text-navy">{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {registration.status === "confirmed" && (
        <div className="flex flex-col items-center border-t border-dashed border-slate-300 px-6 py-6">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <QRCodeSVG value={`yourclub:reg:${registration.id}`} size={160} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Ticket ID: {registration.id}</p>
          {registration.checked_in && (
            <p className="mt-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Checked in
            </p>
          )}
        </div>
      )}

      <div className="space-y-4 border-t border-slate-200 bg-slate-50 px-6 py-5">
        <div className="flex flex-wrap items-start gap-3">
          <Link
            href="/my-registrations"
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            My registrations
          </Link>

          {registration.status !== "cancelled" && (
            <DownloadTicketButton
              ticket={{
                registrationId: registration.id,
                status: registration.status,
                eventTitle: event.title,
                festTitle: event.fests?.title ?? null,
                startTime: event.start_time,
                endTime: event.end_time,
                venue: event.venue,
                fee: event.fee ?? 0,
                name: registration.full_name,
                studentId: registration.student_id,
                department: registration.department,
                email: registration.email,
                phone: registration.phone,
                registeredAt: registration.created_at,
                qrValue: `yourclub:reg:${registration.id}`,
              }}
            />
          )}

          {registration.status !== "cancelled" && (
            <a
              href={calendarUrl(event, registration.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-slate-50"
            >
              <CalendarPlus size={16} />
              Add to Google Calendar
            </a>
          )}
        </div>
        {canCancel && <CancelButton registrationId={registration.id} />}
      </div>
    </div>
  );
}