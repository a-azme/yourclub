"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { deleteUser } from "@/app/admin/users/actions";

type Props = {
  userId: string;
  name: string;
  registrationCount?: number;
};

export default function DeleteUserButton({ userId, name, registrationCount = 0 }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const res = await deleteUser(userId);
    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }
    setConfirming(false);
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
    <div className="w-72 space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 text-left">
      <p className="text-sm font-medium text-red-800">
        Delete the account of &quot;{name}&quot;? They will not be able to sign in again.
        {registrationCount > 0 ? ` Their ${registrationCount} registration(s) may be removed too.` : ""} This cannot be undone.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" loading={loading} className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
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
          Keep account
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