import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Select({
  label,
  error,
  hint,
  id,
  className,
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;
  const describedBy = error
    ? `${selectId}-error`
    : hint
      ? `${selectId}-hint`
      : undefined;

  return (
    <div>
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-navy">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900",
          "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
          error ? "border-red-400" : "border-slate-300",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p id={`${selectId}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}