"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { DEPARTMENTS } from "@/lib/constants";

type Props = {
  userId: string;
  email: string;
  initial: {
    fullName: string;
    studentId: string;
    phone: string;
    department: string;
  };
};

type FormState = Props["initial"];
type Errors = Partial<Record<keyof FormState, string>>;

function validate(v: FormState): Errors {
  const errors: Errors = {};
  if (v.fullName.trim().length < 3) errors.fullName = "Enter your full name.";
  if (!v.studentId.trim()) errors.studentId = "Student ID is required.";
  if (!/^01[3-9]\d{8}$/.test(v.phone.trim()))
    errors.phone = "Enter a valid 11-digit mobile number (e.g. 01712345678).";
  if (!DEPARTMENTS.includes(v.department)) errors.department = "Choose your class / department.";
  return errors;
}

export default function ProfileForm({ userId, email, initial }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>({
    ...initial,
    department: DEPARTMENTS.includes(initial.department) ? initial.department : "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    setNotice(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setNotice(null);

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName.trim(),
        student_id: values.studentId.trim(),
        phone: values.phone.trim(),
        department: values.department,
      })
      .eq("id", userId)
      .select("id");

    setLoading(false);
    if (error || !data || data.length === 0) {
      setFormError(error?.message ?? "Could not save your profile.");
      return;
    }

    setNotice("Profile saved. Your event registration forms will now be pre-filled.");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
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
        value={email}
        readOnly
        hint="Linked to your account and cannot be changed here."
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
        error={errors.department}
        onChange={(e) => update("department", e.target.value)}
      >
        <option value="">Select your class / department</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </Select>

      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {notice}
        </p>
      )}

      <Button type="submit" loading={loading}>
        Save profile
      </Button>
    </form>
  );
}