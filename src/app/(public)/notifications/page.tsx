import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import MarkAllRead from "@/components/notifications/MarkAllRead";

export const metadata = { title: "Notifications - YourClub" };

type NotificationRow = {
  id: string;
  read: boolean;
  created_at: string;
  title?: string | null;
  message?: string | null;
  body?: string | null;
  type?: string | null;
  registration_id?: string | null;
  event_id?: string | null;
};

function describe(n: NotificationRow) {
  const cancelled = (n.type ?? "").toLowerCase().startsWith("can");
  return {
    cancelled,
    title: n.title ?? (cancelled ? "Registration cancelled" : "Registration confirmed"),
    // cancelled registrations have no ticket to show, so send people to their list
    href: cancelled
      ? "/my-registrations"
      : n.registration_id
        ? `/confirmation/${n.registration_id}`
        : "/my-registrations",
  };
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/notifications");

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (data ?? []) as NotificationRow[];
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-navy">Notifications</h1>
        {unread > 0 && <MarkAllRead />}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          <Bell className="mx-auto mb-3 text-slate-400" size={28} />
          No notifications yet. Updates about your registrations will show up here.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {items.map((n) => {
            const { title, href } = describe(n);
            const text = n.message ?? n.body ?? null;
            const content = (
              <div className="flex gap-3 px-4 py-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-brand"}`}
                  aria-label={n.read ? "Read" : "Unread"}
                />
                <div className="min-w-0">
                  <p className={`text-sm ${n.read ? "text-slate-700" : "font-semibold text-navy"}`}>
                    {title}
                  </p>
                  {text && <p className="mt-0.5 text-sm text-slate-600">{text}</p>}
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                {href ? (
                  <Link href={href} className="block hover:bg-slate-50">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}