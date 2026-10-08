import { CATEGORY_STYLES } from "@/lib/constants";
import type { EventCategory } from "@/types";

export default function CategoryBadge({ category }: { category: string }) {
  const style =
    CATEGORY_STYLES[category as EventCategory] ?? "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${style}`}
    >
      {category}
    </span>
  );
}