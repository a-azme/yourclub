import { cn } from "@/lib/utils";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Field({ label, error, hint, id, className, ...props }: FieldProps) {
  const inputId = id ?? props.name;
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-navy">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
          "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
          error ? "border-red-400" : "border-slate-300",
          className
        )}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}