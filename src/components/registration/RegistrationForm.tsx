"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { DEPARTMENTS } from "@/lib/constants";

type Props = {
  eventId: string;
  isFull: boolean;
  initial: {
    fullName: string;
    email: string;
    phone: string;
    studentId: string;
    department: string;
  };
};

type FormState = {
  fullName: string;
  phone: string;
  studentId: string;
  department: string;
  teamName: string;
  notes: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(v: FormState): Errors {
  const errors: Errors = {};
  if (v.fullName.trim().length < 3) errors.fullName = "Enter your full name.";
  if (!v.studentId.trim()) errors.studentId = "Student ID is required.";
  if (!/^01[3-9]\d{8}$/.test(v.phone.trim()))
    errors.phone = "Enter a valid 11-digit mobile number (e.g. 01712345678).";
  return errors;
}

export function RegistrationForm({ eventId, isFull, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>({
    fullName: initial.fullName,
    phone: initial.phone,
    studentId: initial.studentId,
    department: DEPARTMENTS.includes(initial.department)
      ? initial.department
      : DEPARTMENTS[0],
    teamName: "",
    notes: "",
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
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          fullName: values.fullName,
          phone: values.phone,
          studentId: values.studentId,
          department: values.department,
          extra: {
            team_name: values.teamName.trim() || null,
            notes: values.notes.trim() || null,
          },
        }),
      });
      const json = (await res.json()) as { id?: string; error?: string };

      if (!res.ok || !json.id) {
        setFormError(json.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      router.push(`/confirmation/${json.id}`);
      router.refresh();
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field
        label="Full name"
        name="fullName"
        autoComplete="name"
        value={values.fullName}
        error={errors.fullName}
        onChange={(e) => update("fullName", e.target.value)}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        value={initial.email}
        readOnly
        hint="Linked to your account."
        className="bg-slate-50"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Student ID"
          name="studentId"
          placeholder="DRMC-2301"
          value={values.studentId}
          error={errors.studentId}
          onChange={(e) => update("studentId", e.target.value)}
        />
        <Field
          label="Mobile number"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="01712345678"
          value={values.phone}
          error={errors.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </div>
      <Select
        label="Class / Department"
        name="department"
        value={values.department}
        onChange={(e) => update("department", e.target.value)}
      >
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Select>
      <Field
        label="Team name (optional)"
        name="teamName"
        value={values.teamName}
        onChange={(e) => update("teamName", e.target.value)}
      />
      <Field
        label="Notes (optional)"
        name="notes"
        value={values.notes}
        onChange={(e) => update("notes", e.target.value)}
      />

      {isFull && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
          This event is full. You will be added to the waitlist.
        </p>
      )}
      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <Button type="submit" loading={loading} className="w-full">
        {isFull ? "Join waitlist" : "Register now"}
      </Button>
    </form>
  );
}