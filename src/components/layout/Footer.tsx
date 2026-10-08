import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-soft">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:px-6">
        <Logo />
        <p>&copy; 2026 YourClub. Built for the DRMC International Tech Carnival.</p>
        <div className="flex gap-5 font-medium text-navy">
          <Link href="/fests" className="hover:text-brand">Fests</Link>
          <Link href="/events" className="hover:text-brand">Events</Link>
          <Link href="/login" className="hover:text-brand">Organizer Login</Link>
        </div>
      </div>
    </footer>
  );
}