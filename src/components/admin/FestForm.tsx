"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import DeleteFestButton from "@/components/admin/DeleteFestButton";
import type { Fest } from "@/types";

type Props = {
  organizations: { id: string; name: string }[];
  fest?: Fest;
  eventCount?: number;
};

type FormState = {
  organizationId: string;
  title: string;
  tagline: string;
  venue: string;
  description: string;
  startDate: string;
  endDate: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(v: FormState): Errors {
  const e: Errors = {};
  if (!v.organizationId) e.organizationId = "Choose an organization.";
  if (v.title.trim().length < 3) e.title = "Enter a fest title (at least 3 characters).";
  if (!v.startDate) e.startDate = "Start date is required.";
  if (!v.endDate) e.endDate = "End date is required.";
  if (v.startDate && v.endDate && v.endDate < v.startDate) {
    e.endDate = "End date must be on or after the start date.";
  }
  return e;
}

export default function FestForm({ organizations, fest, eventCount = 0 }: Props) {
  const router = useRouter();
  const isEdit = Boolean(fest);

  const [values, setValues] = useState<FormState>({
    organizationId: fest?.organization_id ?? "",
    title: fest?.title ?? "",
    tagline: fest?.tagline ?? "",
    venue: fest?.venue ?? "",
    description: fest?.description ?? "",
    startDate: fest?.start_date?.slice(0, 10) ?? "",
    endDate: fest?.end_date?.slice(0, 10) ?? "",
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
      organization_id: values.organizationId,
      title: values.title.trim(),
      tagline: values.tagline.trim() || null,
      venue: values.venue.trim() || null,
      description: values.description.trim() || null,
      start_date: values.startDate,
      end_date: values.endDate,
    };

    const { data, error } = isEdit
      ? await supabase.from("fests").update(payload).eq("id", fest!.id).select("id")
      : await supabase.from("fests").insert(payload).select("id");

    if (error || !data || data.length === 0) {
      setFormError(error?.message ?? "Could not save this fest. Make sure you are signed in as an admin.");
      setLoading(false);
      return;
    }

    router.push("/admin/fests");
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
        <Select
          label="Organization"
          name="organizationId"
          value={values.organizationId}
          error={errors.organizationId}
          onChange={(e) => update("organizationId", e.target.value)}
        >
          <option value="">Select an organization</option>
          {organizations.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>

        <Field
          label="Fest title"
          name="title"
          value={values.title}
          error={errors.title}
          onChange={(e) => update("title", e.target.value)}
        />

        <Field
          label="Tagline"
          name="tagline"
          placeholder="Innovate. Compete. Create."
          value={values.tagline}
          onChange={(e) => update("tagline", e.target.value)}
        />

        <Field
          label="Venue"
          name="venue"
          placeholder="DRMC Campus"
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
            placeholder="What is this fest about?"
            className={textareaClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Start date"
            name="startDate"
            type="date"
            value={values.startDate}
            error={errors.startDate}
            onChange={(e) => update("startDate", e.target.value)}
          />
          <Field
            label="End date"
            name="endDate"
            type="date"
            value={values.endDate}
            error={errors.endDate}
            onChange={(e) => update("endDate", e.target.value)}
          />
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={loading}>
            {isEdit ? "Save changes" : "Create fest"}
          </Button>
          <Link
            href="/admin/fests"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>

      {isEdit && fest && (
        <div className="rounded-xl border border-red-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-red-700">Danger zone</h2>
          <p className="mb-3 mt-1 text-sm text-slate-600">
            Deleting a fest removes it from the website for everyone.
          </p>
          <DeleteFestButton
            festId={fest.id}
            title={fest.title}
            eventCount={eventCount}
            redirectTo="/admin/fests"
          />
        </div>
      )}
    </div>
  );
}