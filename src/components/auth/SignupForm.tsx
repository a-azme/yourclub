"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import GoogleButton from "@/components/auth/GoogleButton";
import { DEPARTMENTS } from "@/lib/constants";

type FormState = {
  fullName: string;
  studentId: string;
  phone: string;
  department: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const INITIAL: FormState = {
  fullName: "",
  studentId: "",
  phone: "",
  department: DEPARTMENTS[0],
  email: "",
  password: "",
  confirmPassword: "",
};

function validate(values: FormState): Errors {
  const errors: Errors = {};
  if (values.fullName.trim().length < 3) errors.fullName = "Enter your full name.";
  if (!values.studentId.trim()) errors.studentId = "Student ID is required.";
  if (!/^01[3-9]\d{8}$/.test(values.phone.trim()))
    errors.phone = "Enter a valid 11-digit mobile number (e.g. 01712345678).";
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Enter a valid email.";
  if (values.password.length < 8)
    errors.password = "Password must be at least 8 characters.";
  if (values.confirmPassword !== values.password)
    errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
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
    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        data: {
          full_name: values.fullName.trim(),
          student_id: values.studentId.trim(),
          phone: values.phone.trim(),
          department: values.department,
        },
      },
    });

    if (error) {
      setFormError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.replace("/");
      router.refresh();
      return;
    }

    setNotice("Account created! Please check your email to confirm your address, then log in.");
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Sign up once and register for any event in seconds.
      </p>

      <div className="mt-6">
        <GoogleButton label="Sign up with Google" />
      </div>
      <div className="mt-5 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or sign up with email
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Field
          label="Full name"
          name="fullName"
          autoComplete="name"
          value={values.fullName}
          error={errors.fullName}
          onChange={(e) => update("fullName", e.target.value)}
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

        <div>
          <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-navy">
            Class / Department
          </label>
          <select
            id="department"
            name="department"
            value={values.department}
            onChange={(e) => update("department", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            hint="At least 8 characters."
            value={values.password}
            error={errors.password}
            onChange={(e) => update("password", e.target.value)}
          />
          <Field
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            error={errors.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
          />
        </div>

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

        <Button type="submit" loading={loading} className="w-full">
          Sign up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}