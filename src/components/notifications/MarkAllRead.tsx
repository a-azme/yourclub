"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function MarkAllRead() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  async function markAll() {
    setLoading(true);
    await supabase.from("notifications").update({ read: true }).eq("read", false);
    setLoading(false);
    window.dispatchEvent(new Event("notifications:updated"));
    startTransition(() => router.refresh());
  }

  return (
    <Button type="button" variant="outline" loading={loading} onClick={markAll}>
      Mark all as read
    </Button>
  );
}