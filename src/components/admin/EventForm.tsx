"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import DeleteEventButton from "@/components/admin/DeleteEventButton";
import { CATEGORIES } from "@/lib/constants";
import type { EventItem } from "@/types";

type Props = {
  fests: { id: string; title: string }[];
  event?: EventItem;
};

type FormState = {
  festId: string;
  title: string;
  category: string;
  venue: string;
  description: string;
  startTime: string;
  endTime: string;
  deadline: string;
  capacity: string;
  fee: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const TZ = "Asia/Dhaka";

/** ISO timestamp -> "YYYY-MM-DDTHH:mm" in Asia/Dhaka, for <input type="datetime-local">. */
function toInput(iso?: string) {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** "YYYY-MM-DDTHH:mm" entered in Asia/Dhaka (UTC+6, no DST) -> epoch ms. */
function toMs(value: string) {
  return value ? new Date(`${value}:00+06:00`).getTime() : NaN;
}

function toIso(value: string) {
  return new Date(toMs(value)).toISOString();
}

function validate(v: FormState): Errors {
  const e: Errors = {};
  if (!v.festId) e.festId = "Choose a fest.";
  if (v.title.trim().length < 3) e.title = "Enter an event title (at least 3 characters).";
  if (!v.startTime) e.startTime = "Start time is required.";
  if (!v.endTime) e.endTime = "End time is required.";
  if (!v.deadline) e.deadline = "Registration deadline is required.";

  const start = toMs(v.startTime);
  const end = toMs(v.endTime);
  const deadline = toMs(v.deadline);
  if (v.startTime && v.endTime && end <= start) {
    e.endTime = "End time must be after the start time.";
  }
  if (v.startTime && v.deadline && deadline > start) {
    e.deadline = "The deadline must be on or before the start time.";
  }

  const capacity = Number(v.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) {
    e.capacity = "Capacity must be a whole number, at least 1.";
  }
  const fee = Number(v.fee || "0");
  if (!Number.isFinite(fee) || fee < 0) e.fee = "Fee cannot be negative.";
  return e;
}

export default function EventForm({ fests, event }: Props) {
  const router = useRouter();
  const isEdit = Boolean(event);

  const [values, setValues] = useState<FormState>({
    festId: event?.fest_id ?? "",
    title: event?.title ?? "",
    category: event?.category ?? CATEGORIES[0],
    venue: event?.venue ?? "",
    description: event?.description ?? "",
    startTime: toInput(event?.start_time),
    endTime: toInput(event?.end_time),
    deadline: toInput(event?.registration_deadline),
    capacity: String(event?.capacity ?? 50),
    fee: String(event?.fee ?? 0),
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    const supabase = createClient();

    const payload = {
      fest_id: values.festId,
      title: values.title.trim(),
      category: values.category,
      venue: values.venue.trim() || null,
      description: values.description.trim() || null,
      start_time: toIso(values.startTime),
      end_time: toIso(values.endTime),
      registration_deadline: toIso(values.deadline),
      capacity: Number(values.capacity),
      fee: Number(values.fee || "0"),
    };

    const { data, error } = isEdit
      ? await supabase.from("events").update(payload).eq("id", event!.id).select("id")
      : await supabase.from("events").insert(payload).select("id");

    if (error || !data || data.length === 0) {
      setFormError(error?.message ?? "Could not save this event.");
      setLoading(false);
      return;
    }

    router.push("/admin/events");
    router.refresh();
  }

  const textareaClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Fest"
            name="festId"
            value={values.festId}
            error={errors.festId}
            onChange={(e) => update("festId", e.target.value)}
          >
            <option value="">Select a fest</option>
            {fests.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </Select>
          <Select
            label="Category"
            name="category"
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <Field
          label="Event title"
          name="title"
          value={values.title}
          error={errors.title}
          onChange={(e) => update("title", e.target.value)}
        />

        <Field
          label="Venue"
          name="venue"
          placeholder="Computer Lab 1, DRMC"
          value={values.venue}
          onChange={(e) => update("venue", e.target.value)}
        />

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-navy">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What is this event about?"
            className={textareaClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Start (Dhaka time)"
            name="startTime"
            type="datetime-local"
            value={values.startTime}
            error={errors.startTime}
            onChange={(e) => update("startTime", e.target.value)}
          />
          <Field
            label="End (Dhaka time)"
            name="endTime"
            type="datetime-local"
            value={values.endTime}
            error={errors.endTime}
            onChange={(e) => update("endTime", e.target.value)}
          />
          <Field
            label="Registration deadline"
            name="deadline"
            type="datetime-local"
            value={values.deadline}
            error={errors.deadline}
            onChange={(e) => update("deadline", e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Capacity (seats)"
            name="capacity"
            type="number"
            min={1}
            value={values.capacity}
            error={errors.capacity}
            hint="When full, new registrations go to the waitlist."
            onChange={(e) => update("capacity", e.target.value)}
          />
          <Field
            label="Fee (৳)"
            name="fee"
            type="number"
            min={0}
            value={values.fee}
            error={errors.fee}
            hint="Use 0 for a free event."
            onChange={(e) => update("fee", e.target.value)}
          />
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={loading}>
            {isEdit ? "Save changes" : "Create event"}
          </Button>
          <Link
            href="/admin/events"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>

      {isEdit && event && (
        <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-red-700">Danger zone</h2>
          <p className="mb-3 mt-1 text-sm text-slate-600">
            Deleting an event removes it from the website for everyone.
          </p>
          <DeleteEventButton
            eventId={event.id}
            title={event.title}
            redirectTo="/admin/events"
          />
        </div>
      )}
    </div>
  );
}