"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type Props = {
  festId: string;
  title: string;
  eventCount?: number;
  /** If set, go to this page after deleting (used on the edit page). */
  redirectTo?: string;
};

export default function DeleteFestButton({ festId, title, eventCount = 0, redirectTo }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: deleteError } = await supabase
      .from("fests")
      .delete()
      .eq("id", festId)
      .select("id");

    if (deleteError || !data || data.length === 0) {
      setError(deleteError?.message ?? "Could not delete this fest. Make sure you are signed in as an admin.");
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
    <div className="max-w-md space-y-2 rounded-lg border border-red-200 bg-red-50 p-3">
      <p className="text-sm font-medium text-red-800">
        Delete &quot;{title}&quot;?
        {eventCount > 0
          ? ` This fest has ${eventCount} event(s). Delete or move them first, or they may be removed with the fest.`
          : ""}{" "}
        This cannot be undone.
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