"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  eventId: string;
  title: string;
  /** Confirmed + waitlisted registrations, shown in the warning. */
  registrationCount?: number;
  /** If set, go to this page after deleting (used on the edit page). */
  redirectTo?: string;
};

export default function DeleteEventButton({
  eventId,
  title,
  registrationCount = 0,
  redirectTo,
}: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .select("id");

    if (deleteError || !data || data.length === 0) {
      setError(deleteError?.message ?? "Could not delete this event.");
      setLoading(false);
      return;
    }

    setConfirming(false);
    setLoading(false);
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3">
      <p className="text-sm font-medium text-red-800">
        Delete &quot;{title}&quot;?{" "}
        {registrationCount > 0
          ? `${registrationCount} registration${registrationCount === 1 ? "" : "s"} (including waitlist) will be affected. `
          : ""}
        This cannot be undone.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={handleDelete}
          className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Deleting..." : "Yes, delete"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
        >
          Keep it
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}