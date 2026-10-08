import { Download } from "lucide-react";

export default function ExportButton({ eventId }: { eventId: string }) {
  return (
    <a
      href={`/api/export/${eventId}`}
      download
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-slate-50"
    >
      <Download size={16} />
      Export CSV
    </a>
  );
}