import Link from "next/link";
import EventForm from "@/components/admin/EventForm";
import { getFests } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const fests = await getFests();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/admin/events" className="text-sm font-semibold text-brand hover:underline">
        Back to events
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-navy">New event</h1>
      <p className="mb-6 mt-1 text-slate-600">Fill in the details. The event appears on the site right after you create it.</p>
      <EventForm fests={fests.map((f) => ({ id: f.id, title: f.title }))} />
    </div>
  );
}