import { STATUS_LABELS, STATUS_STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { RegistrationStatus } from "@/types";

export default function StatusBadge({
  status,
  className,
}: {
  status: RegistrationStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}