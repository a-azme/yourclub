import Link from "next/link";
import { notFound } from "next/navigation";
import FestForm from "@/components/admin/FestForm";
import { getEvents, getFest } from "@/lib/queries";
import { getOrganizations } from "@/lib/organization-queries";

export const dynamic = "force-dynamic";

export default async function EditFestPage({ params }: { params: Promise<{ festId: string }> }) {
  const { festId } = await params;
  const [fest, organizations, events] = await Promise.all([
    getFest(festId),
    getOrganizations(),
    getEvents({ fest: festId }),
  ]);
  if (!fest) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/admin/fests" className="text-sm font-semibold text-brand hover:underline">
        Back to fests
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-navy">Edit fest</h1>
      <p className="mb-6 mt-1 text-slate-600">{fest.title}</p>
      <FestForm organizations={organizations} fest={fest} eventCount={events.length} />
    </div>
  );
}