import Link from "next/link";
import FestForm from "@/components/admin/FestForm";
import { getOrganizations } from "@/lib/organization-queries";

export const dynamic = "force-dynamic";

export default async function NewFestPage() {
  const organizations = await getOrganizations();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/admin/fests" className="text-sm font-semibold text-brand hover:underline">
        Back to fests
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-navy">New fest</h1>
      <p className="mb-6 mt-1 text-slate-600">The fest appears on the site right after you create it.</p>
      <FestForm organizations={organizations} />
    </div>
  );
}