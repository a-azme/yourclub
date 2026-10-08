"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NotificationBell() {
  const pathname = usePathname();
  const [supabase] = useState(() => createClient());
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const { count: unread } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("read", false);
    setCount(unread ?? 0);
  }, [supabase]);

  useEffect(() => {
    const first = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => void refresh(), 60_000);
    const onUpdate = () => void refresh();
    window.addEventListener("notifications:updated", onUpdate);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      window.removeEventListener("notifications:updated", onUpdate);
    };
  }, [pathname, refresh]);

  return (
    <Link
      href="/notifications"
      aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
      className="relative rounded-full p-2 text-navy hover:bg-slate-100"
    >
      <Bell size={20} />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}