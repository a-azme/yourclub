"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
    setLoading(false);
  }

  return (
    <Button variant="outline" onClick={handleSignOut} loading={loading}>
      Log out
    </Button>
  );
}