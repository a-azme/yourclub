"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type Props = {
  eventId: string;
  title: string;
  /** If set, go to this page after deleting (used on the edit page). */
  redirectTo?: string;
};

export default function DeleteEventButton({ eventId, title, redirectTo }: Props) {
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
      <Button
        type="button"
        variant="outline"
        className="border-red-200 text-red-700 hover:bg-red-50"
        onClick={() => setConfirming(true)}
      >
        Delete
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3">
      <p className="text-sm font-medium text-red-800">
        Delete &quot;{title}&quot;? Its registrations will be affected. This cannot be undone.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          loading={loading}
          className="bg-red-600 hover:bg-red-700"
          onClick={handleDelete}
        >
          Yes, delete
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={loading}
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
        >
          Keep it
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}