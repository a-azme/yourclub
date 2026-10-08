"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, Search, Shield, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import NotificationBell from "@/components/layout/NotificationBell";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/fests", label: "Fests" },
  { href: "/events", label: "Events" },
  { href: "/my-registrations", label: "My Registrations" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  async function handleSignOut() {
    await signOut();
    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  const displayName = profile?.full_name?.split(" ")[0] ?? "Account";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative px-4 py-5 text-sm font-semibold transition-colors",
                  isActive(l.href) ? "text-brand" : "text-navy hover:text-brand"
                )}
              >
                {l.label}
                {isActive(l.href) && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded bg-brand" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/events"
            aria-label="Search events"
            className="rounded-full p-2 text-navy hover:bg-slate-100"
          >
            <Search size={20} />
          </Link>

          {loading ? (
            <div className="h-9 w-40" aria-hidden="true" />
          ) : user ? (
            <>
              <NotificationBell />
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-navy hover:bg-slate-50"
                >
                  <Shield size={16} />
                  Admin
                </Link>
              )}
              <Link href="/profile" className="text-sm font-medium text-slate-600 hover:text-brand">
  Hi, {displayName}
</Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-navy hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-navy md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="space-y-1 border-t border-slate-100 bg-white px-4 pb-4 pt-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-semibold",
                isActive(l.href) ? "bg-brand-light text-brand" : "text-navy"
              )}
            >
              {l.label}
            </Link>
          ))}

          {user && (
            <Link
              href="/notifications"
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-semibold",
                isActive("/notifications") ? "bg-brand-light text-brand" : "text-navy"
              )}
            >
              Notifications
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-navy"
            >
              Admin dashboard
            </Link>
          )}
          {user && (
  <Link
    href="/profile"
    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-navy"
  >
    My profile
  </Link>
)}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {loading ? null : user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="col-span-2 rounded-lg bg-brand py-2 text-center text-sm font-semibold text-white"
              >
                Sign out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-300 py-2 text-center text-sm font-semibold text-navy"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-brand py-2 text-center text-sm font-semibold text-white"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}