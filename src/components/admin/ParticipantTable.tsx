"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { STATUS_LABELS } from "@/lib/constants";
import { cn, formatDateTime } from "@/lib/utils";
import type { Registration, RegistrationStatus } from "@/types";

const STATUSES: RegistrationStatus[] = ["confirmed", "waitlisted", "cancelled", "pending"];

type StatusFilter = "all" | RegistrationStatus;
type CheckFilter = "all" | "in" | "out";

type Patch = {
  status?: RegistrationStatus;
  checked_in?: boolean;
  cancel_reason?: string | null;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

function teamOf(r: Registration) {
  const v = r.extra?.team_name;
  return typeof v === "string" ? v : "";
}

function StatusSelect({
  r,
  busy,
  seatsFull,
  onChange,
}: {
  r: Registration;
  busy: boolean;
  seatsFull: boolean;
  onChange: (next: RegistrationStatus) => void;
}) {
  return (
    <select
      aria-label={`Status for ${r.full_name}`}
      value={r.status}
      disabled={busy}
      onChange={(e) => onChange(e.target.value as RegistrationStatus)}
      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
    >
      {STATUSES.map((s) => {
        // "Pending" is a legacy status: only show it for rows that already have it
        if (s === "pending" && r.status !== "pending") return null;
        const locked = s === "confirmed" && r.status !== "confirmed" && seatsFull;
        return (
          <option key={s} value={s} disabled={locked}>
            {STATUS_LABELS[s]}
            {locked ? " (no seats)" : ""}
          </option>
        );
      })}
    </select>
  );
}

function CheckInButton({
  r,
  busy,
  onToggle,
}: {
  r: Registration;
  busy: boolean;
  onToggle: () => void;
}) {
  const allowed = r.status === "confirmed";
  return (
    <button
      type="button"
      disabled={!allowed || busy}
      onClick={onToggle}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        r.checked_in
          ? "bg-green-50 text-green-700 hover:bg-green-100"
          : "border border-slate-300 bg-white text-navy hover:bg-slate-50"
      )}
    >
      {r.checked_in ? "Checked in" : "Check in"}
    </button>
  );
}

function CancelDialog({
  r,
  busy,
  onClose,
  onConfirm,
}: {
  r: Registration;
  busy: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h2 id="cancel-title" className="text-lg font-bold text-navy">
          Cancel this registration?
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {r.full_name} will get a notification in their account.
          {r.status === "confirmed"
            ? " Their seat goes to the next person on the waitlist."
            : ""}
        </p>

        <label htmlFor="cancel-reason" className="mt-4 block text-sm font-medium text-navy">
          Reason (optional)
        </label>
        <textarea
          id="cancel-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={300}
          rows={3}
          autoFocus
          placeholder="e.g. Team size limit exceeded"
          className={`${inputClass} mt-1.5`}
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Keep registration
          </Button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onConfirm(reason)}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Cancelling..." : "Cancel registration"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ParticipantTable({
  registrations,
  capacity,
}: {
  registrations: Registration[];
  capacity: number;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [, startTransition] = useTransition();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [check, setCheck] = useState<CheckFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Registration | null>(null);

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: registrations.length,
      pending: 0,
      confirmed: 0,
      waitlisted: 0,
      cancelled: 0,
    };
    registrations.forEach((r) => {
      c[r.status] += 1;
    });
    return c;
  }, [registrations]);

  // Only confirmed registrations hold a seat (same rule as the database)
  const seatsTaken = counts.confirmed;
  const seatsFull = seatsTaken >= capacity;

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return registrations.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (check === "in" && !r.checked_in) return false;
      if (check === "out" && r.checked_in) return false;
      if (!term) return true;
      return [r.full_name, r.email, r.phone, r.student_id, r.department, teamOf(r)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term));
    });
  }, [registrations, q, status, check]);

  async function update(id: string, patch: Patch): Promise<boolean> {
    setBusyId(id);
    setError(null);
    setNotice(null);

    const { data, error: updateError } = await supabase
      .from("registrations")
      .update(patch)
      .eq("id", id)
      .select("id");

    setBusyId(null);
    if (updateError || !data || data.length === 0) {
      setError(updateError?.message ?? "Update failed. Check the admin policy on registrations.");
      return false;
    }
    startTransition(() => router.refresh());
    return true;
  }

  function changeStatus(r: Registration, next: RegistrationStatus) {
    if (next === r.status) return;

    if (next === "cancelled") {
      setCancelTarget(r);
      return;
    }

    if (next === "confirmed" && seatsFull) {
      setError(
        `This event is full (${seatsTaken} / ${capacity} seats). Cancel a confirmed registration or increase the capacity first.`
      );
      return;
    }

    // A ticket is only valid for confirmed registrations
    update(r.id, next === "confirmed" ? { status: next } : { status: next, checked_in: false });
  }

  async function confirmCancel(reason: string) {
    if (!cancelTarget) return;
    const target = cancelTarget;
    const ok = await update(target.id, {
      status: "cancelled",
      checked_in: false,
      cancel_reason: reason.trim() || null,
    });
    if (ok) {
      setCancelTarget(null);
      setNotice(
        target.status === "confirmed"
          ? `${target.full_name} was notified. If someone was on the waitlist, the first person got the seat automatically.`
          : `${target.full_name} was notified.`
      );
    }
  }

  const filterTabs: StatusFilter[] = ["all", "confirmed", "waitlisted", "cancelled"];
  if (counts.pending > 0) filterTabs.push("pending");

  return (
    <div>
      {seatsFull && (
        <div
          role="status"
          className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            All seats are taken ({seatsTaken} / {capacity}). New registrations go to the
            waitlist and are confirmed automatically when a seat opens up or you increase the
            capacity.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {filterTabs.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={status === s}
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              status === s
                ? "bg-brand text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            )}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, phone, student ID or team"
            aria-label="Search participants"
            className={`${inputClass} pl-10`}
          />
        </div>
        <select
          aria-label="Check-in filter"
          value={check}
          onChange={(e) => setCheck(e.target.value as CheckFilter)}
          className={inputClass}
        >
          <option value="all">All check-in states</option>
          <option value="in">Checked in</option>
          <option value="out">Not checked in</option>
        </select>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700"
        >
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {notice}
        </p>
      )}

      <p className="mt-4 text-sm text-slate-500">
        {rows.length} participant{rows.length === 1 ? "" : "s"} shown
      </p>

      {rows.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No participants match your filters.
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-3 hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Participant</th>
                  <th className="px-4 py-3 font-semibold">Student ID</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Class</th>
                  <th className="px-4 py-3 font-semibold">Registered</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id} className="align-middle">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-navy">{r.full_name}</p>
                      <p className="text-xs text-slate-500">{r.email}</p>
                      {teamOf(r) && (
                        <p className="text-xs text-slate-500">Team: {teamOf(r)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{r.student_id ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{r.phone ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{r.department ?? "-"}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDateTime(r.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect
                        r={r}
                        busy={busyId === r.id}
                        seatsFull={seatsFull}
                        onChange={(next) => changeStatus(r, next)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <CheckInButton
                        r={r}
                        busy={busyId === r.id}
                        onToggle={() => update(r.id, { checked_in: !r.checked_in })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="mt-3 space-y-3 md:hidden">
            {rows.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-navy">{r.full_name}</p>
                    <p className="break-words text-xs text-slate-500">{r.email}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-slate-500">Student ID</dt>
                    <dd className="font-medium text-slate-800">{r.student_id ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="font-medium text-slate-800">{r.phone ?? "-"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-500">Class / Department</dt>
                    <dd className="font-medium text-slate-800">{r.department ?? "-"}</dd>
                  </div>
                  {teamOf(r) && (
                    <div className="col-span-2">
                      <dt className="text-slate-500">Team</dt>
                      <dd className="font-medium text-slate-800">{teamOf(r)}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusSelect
                    r={r}
                    busy={busyId === r.id}
                    seatsFull={seatsFull}
                    onChange={(next) => changeStatus(r, next)}
                  />
                  <CheckInButton
                    r={r}
                    busy={busyId === r.id}
                    onToggle={() => update(r.id, { checked_in: !r.checked_in })}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {cancelTarget && (
        <CancelDialog
          key={cancelTarget.id}
          r={cancelTarget}
          busy={busyId === cancelTarget.id}
          onClose={() => setCancelTarget(null)}
          onConfirm={confirmCancel}
        />
      )}
    </div>
  );
}