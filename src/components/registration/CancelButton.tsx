"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type Props = {
  registrationId: string;
  className?: string;
};

export default function CancelButton({ registrationId, className }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from("registrations")
      .update({ status: "cancelled" })
      .eq("id", registrationId)
      .select("id");

    if (updateError || !data || data.length === 0) {
      setError(updateError?.message ?? "Could not cancel this registration.");
      setLoading(false);
      return;
    }

    setConfirming(false);
    setLoading(false);
    router.refresh();
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        className={`border-red-200 text-red-700 hover:bg-red-50 ${className ?? ""}`}
        onClick={() => setConfirming(true)}
      >
        Cancel registration
      </Button>
    );
  }

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <p className="text-sm font-medium text-navy">
        Cancel this registration? Your seat will be released.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          loading={loading}
          className="bg-red-600 hover:bg-red-700"
          onClick={handleCancel}
        >
          Yes, cancel
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
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}