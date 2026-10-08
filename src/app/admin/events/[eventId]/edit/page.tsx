import Link from "next/link";
import { notFound } from "next/navigation";
import EventForm from "@/components/admin/EventForm";
import { getEvent, getFests } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const [event, fests] = await Promise.all([getEvent(eventId), getFests()]);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/admin/events" className="text-sm font-semibold text-brand hover:underline">
        Back to events
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-navy">Edit event</h1>
      <p className="mb-6 mt-1 text-slate-600">{event.title}</p>
      <EventForm fests={fests.map((f) => ({ id: f.id, title: f.title }))} event={event} />
    </div>
  );
}