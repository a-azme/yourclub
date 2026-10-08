"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export function useAuth() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(
    async (u: User | null) => {
      if (!u) {
        setProfile(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();
      setProfile((data as Profile | null) ?? null);
    },
    [supabase]
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      setUser(data.user);
      await loadProfile(data.user);
      if (active) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      setUser(next);
      // Defer to avoid calling Supabase inside the auth callback
      setTimeout(() => {
        void loadProfile(next);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  return {
    user,
    profile,
    isAdmin: profile?.role === "admin",
    loading,
    signOut,
  };
}