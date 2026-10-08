import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5", className)}
      aria-label="YourClub home"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-navy shadow-sm ring-1 ring-black/5">
        <svg
          viewBox="0 0 48 48"
          className="h-8 w-8 text-white"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* C: Y ke ghire thaka ring, daan dik khola */}
          <path d="M35.49 14.36 A15 15 0 1 0 35.49 33.64" strokeWidth="3.5" />
          {/* Y */}
          <path d="M17.5 16.5 L24 25 L30.5 16.5 M24 25 V32" strokeWidth="4" />
        </svg>
      </span>
      <span className="text-xl font-bold tracking-tight text-navy">
        Your<span className="text-brand">Club</span>
      </span>
    </Link>
  );
}