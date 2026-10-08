import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in | YourClub",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="py-10 text-center text-sm text-slate-500">Loading...</p>}>
      <LoginForm />
    </Suspense>
  );
}