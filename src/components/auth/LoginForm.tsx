"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import GoogleButton from "@/components/auth/GoogleButton";
import { safeRedirect } from "@/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeRedirect(params.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    params.get("error") === "google" ? "Google sign-in failed. Please try again." : null
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        const message = signInError.message;
        if (message === "Invalid login credentials") {
          setError("Incorrect email or password.");
        } else if (message.toLowerCase().includes("fetch")) {
          setError("Cannot reach the server. Please try again in a moment.");
        } else {
          setError(message);
        }
        setLoading(false);
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">
        Log in to register for events and manage your registrations.
      </p>

      <div className="mt-6">
        <GoogleButton next={next} label="Continue with Google" />
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or log in with email
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} disabled={loading} className="w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}