import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DeleteUserButton from "@/components/admin/DeleteUserButton";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 200;

function clean(term: string) {
  return term.replace(/[%,()*\\]/g, " ").replace(/\s+/g, " ").trim();
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const sp = await searchParams;
  const term = sp.q ? clean(sp.q) : "";
  const role = sp.role === "admin" || sp.role === "user" ? sp.role : "";

  const supabase = await createClient();
  const {
    data: { user: me },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (term) {
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%,student_id.ilike.%${term}%`);
  }
  if (role) query = query.eq("role", role);

  const { data, count, error } = await query;
  if (error) console.error("admin users:", error.message);
  const users = (data ?? []) as Profile[];

  // Active (not cancelled) registrations per user
  const regCounts: Record<string, number> = {};
  if (users.length > 0) {
    const { data: regs } = await supabase
      .from("registrations")
      .select("user_id, status")
      .in(
        "user_id",
        users.map((u) => u.id)
      );
    for (const r of regs ?? []) {
      if (r.status !== "cancelled") regCounts[r.user_id] = (regCounts[r.user_id] ?? 0) + 1;
    }
  }

  const inputCls =
    "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Users</h1>
      <p className="mt-1 text-slate-600">Everyone who has an account on the website.</p>

      <form method="get" className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search name, email or student ID"
            className={`${inputCls} w-72 pl-9`}
          />
        </div>
        <select name="role" defaultValue={role} className={inputCls}>
          <option value="">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Search
        </button>
        {(term || role) && (
          <Link href="/admin/users" className="text-sm font-semibold text-slate-600 hover:text-navy">
            Clear
          </Link>
        )}
      </form>

      <p className="mb-3 mt-4 text-sm text-slate-500">
        Showing {users.length} of {count ?? users.length} users
        {(count ?? 0) > PAGE_SIZE ? ` (latest ${PAGE_SIZE}, use search to find others)` : ""}
      </p>

      {users.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No users found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Student ID</th>
                <th className="px-4 py-3 font-semibold">Class / Department</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Registrations</th>
                <th className="px-4 py-3 font-semibold">Joined</th>
                <th className="px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-navy">{u.full_name || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.student_id ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.department ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.phone ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === "admin" ? "bg-brand-light text-brand" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{regCounts[u.id] ?? 0}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    {u.role === "admin" || u.id === me?.id ? (
                      <span className="text-xs text-slate-400">-</span>
                    ) : (
                      <DeleteUserButton
                        userId={u.id}
                        name={u.full_name || u.email}
                        registrationCount={regCounts[u.id] ?? 0}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}