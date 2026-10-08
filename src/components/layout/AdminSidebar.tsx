"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Layers,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/organizations", label: "Organizations", icon: Building2, exact: false },
  { href: "/admin/fests", label: "Fests", icon: Layers, exact: false },
  { href: "/admin/events", label: "Events & participants", icon: CalendarDays, exact: false },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-slate-200 bg-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:block md:px-5 md:py-5">
        <Logo />
        <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand md:mt-3 md:inline-block">
          Admin panel
        </span>
      </div>

      <nav
        aria-label="Admin"
        className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0"
      >
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "bg-brand-light text-brand" : "text-navy hover:bg-slate-100"
              )}
            >
              <l.icon size={18} />
              {l.label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 md:mt-4"
        >
          <ArrowLeft size={18} />
          Back to site
        </Link>
      </nav>
    </aside>
  );
}