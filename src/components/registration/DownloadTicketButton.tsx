"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { formatDate, formatDateTime, formatTime } from "@/lib/utils";

export type TicketData = {
  registrationId: string;
  status: string;
  eventTitle: string;
  festTitle?: string | null;
  startTime: string;
  endTime: string;
  venue: string | null;
  fee: number;
  name: string;
  studentId: string | null;
  department: string | null;
  email: string;
  phone?: string | null;
  registeredAt: string;
  /** Text encoded in the QR code (the same value your confirmation page QR uses). */
  qrValue: string;
};

type RGB = [number, number, number];

const NAVY: RGB = [11, 31, 75];
const GRAY: RGB = [100, 116, 139];
const BRAND: RGB = [29, 95, 224];
const LINE: RGB = [226, 232, 240];
const SOFT: RGB = [241, 245, 249];

const STATUS_COLORS: Record<string, { bg: RGB; fg: RGB }> = {
  confirmed: { bg: [220, 252, 231], fg: [21, 128, 61] },
  pending: { bg: [254, 243, 199], fg: [180, 83, 9] },
  waitlisted: { bg: [226, 232, 240], fg: [51, 65, 85] },
  cancelled: { bg: [254, 226, 226], fg: [185, 28, 28] },
};

/**
 * Renders the YourClub logo icon (same design as the website Logo component)
 * on a canvas with a smooth gradient and returns it as a PNG data URL.
 */
function createLogoPng(): string | null {
  try {
    const size = 600;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Rounded square with a smooth top-left -> bottom-right gradient
    const radius = 150;
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, "#1d5fe0");
    gradient.addColorStop(1, "#0b1f4b");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.arcTo(size, 0, size, size, radius);
    ctx.arcTo(size, size, 0, size, radius);
    ctx.arcTo(0, size, 0, 0, radius);
    ctx.arcTo(0, 0, size, 0, radius);
    ctx.closePath();
    ctx.fill();

    // Icon is 80% of the box, centered (same as h-8 inside h-10)
    const iconSize = size * 0.8;
    const offset = (size - iconSize) / 2;
    ctx.translate(offset, offset);
    ctx.scale(iconSize / 48, iconSize / 48);

    ctx.strokeStyle = "#ffffff";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // "C" ring: center (24,24), radius 15, open on the right side
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    const a0 = Math.atan2(14.36 - 24, 35.49 - 24);
    const a1 = Math.atan2(33.64 - 24, 35.49 - 24);
    ctx.arc(24, 24, 15, a0, a1, true); // counter-clockwise = the long way round the left
    ctx.stroke();

    // "Y" inside the ring
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(17.5, 16.5);
    ctx.lineTo(24, 25);
    ctx.lineTo(30.5, 16.5);
    ctx.moveTo(24, 25);
    ctx.lineTo(24, 32);
    ctx.stroke();

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export default function DownloadTicketButton({
  ticket,
  className = "",
}: {
  ticket: TicketData;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setBusy(true);
    setError(null);

    try {
      const [{ jsPDF }, { toDataURL }] = await Promise.all([import("jspdf"), import("qrcode")]);

      const qr = await toDataURL(ticket.qrValue, {
        margin: 1,
        width: 480,
        errorCorrectionLevel: "M",
      });
      const logoPng = createLogoPng();

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = 210;
      const M = 15;
      const R = W - M;
      const passNo = `PASS-${ticket.registrationId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
      const statusKey = ticket.status.toLowerCase();
      const statusColors = STATUS_COLORS[statusKey] ?? STATUS_COLORS.pending;

      // ---------- Header (white, with logo) ----------
      const logoSize = 14;
      const logoX = M;
      const logoY = 9;
      if (logoPng) {
        doc.addImage(logoPng, "PNG", logoX, logoY, logoSize, logoSize);
      } else {
        doc.setFillColor(...NAVY);
        doc.roundedRect(logoX, logoY, logoSize, logoSize, 3, 3, "F");
      }

      // Wordmark: "Your" (navy) + "Club" (brand blue)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...NAVY);
      doc.text("Your", logoX + logoSize + 3.5, logoY + 9.8);
      const yourW = doc.getTextWidth("Your");
      doc.setTextColor(...BRAND);
      doc.text("Club", logoX + logoSize + 3.5 + yourW, logoY + 9.8);

      doc.setTextColor(...GRAY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("ENTRY PASS NO", R, 11, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...NAVY);
      doc.text(passNo, R, 17.5, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      doc.text(`Issued: ${formatDate(new Date().toISOString())}`, R, 23, { align: "right" });

      // Brand line under header
      doc.setFillColor(...BRAND);
      doc.rect(0, 28, W, 1.2, "F");

      // Document title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(...NAVY);
      doc.text("Event Entry Pass & Confirmation", M, 39);

      // ---------- Status chip ----------
      let y = 48;
      doc.setFillColor(...statusColors.bg);
      doc.roundedRect(M, y - 5.5, 36, 8, 2, 2, "F");
      doc.setTextColor(...statusColors.fg);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(ticket.status.toUpperCase(), M + 18, y, { align: "center" });

      // ---------- Helpers ----------
      const section = (title: string) => {
        y += 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(...BRAND);
        doc.text(title.toUpperCase(), M, y);
        y += 2.5;
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.2);
        doc.line(M, y, R, y);
        y += 6;
      };

      const field = (label: string, value: string, x: number, width: number) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text(label.toUpperCase(), x, y);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...NAVY);
        const lines: string[] = doc.splitTextToSize(value || "-", width);
        doc.text(lines, x, y + 5);
        return lines.length;
      };

      const colWidth = (R - M) / 2 - 4;
      const row = (a: [string, string], b: [string, string]) => {
        const la = field(a[0], a[1], M, colWidth);
        const lb = field(b[0], b[1], M + colWidth + 8, colWidth);
        y += 6 + Math.max(la, lb) * 5 + 1;
      };

      // ---------- Event ----------
      section("Event");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...NAVY);
      const titleLines: string[] = doc.splitTextToSize(ticket.eventTitle, R - M);
      doc.text(titleLines, M, y);
      y += titleLines.length * 7;

      if (ticket.festTitle) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(...GRAY);
        doc.text(ticket.festTitle, M, y);
        y += 6;
      }
      y += 1;

      row(
        ["Date", formatDate(ticket.startTime)],
        ["Time", `${formatTime(ticket.startTime)} - ${formatTime(ticket.endTime)}`]
      );
      row(["Venue", ticket.venue ?? "To be announced"], ["Registration status", ticket.status]);

      // ---------- Participant ----------
      section("Participant");
      row(["Name", ticket.name], ["Student ID", ticket.studentId ?? "-"]);
      row(["Class / Department", ticket.department ?? "-"], ["Email", ticket.email]);
      row(["Phone", ticket.phone ?? "-"], ["Registered on", formatDateTime(ticket.registeredAt)]);

      // ---------- Fee ----------
      section("Fee");
      doc.setFillColor(...SOFT);
      doc.rect(M, y - 5, R - M, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      doc.text("DESCRIPTION", M + 3, y);
      doc.text("AMOUNT", R - 3, y, { align: "right" });
      y += 8;

      const amount = ticket.fee > 0 ? `BDT ${ticket.fee}` : "Free";
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...NAVY);
      const desc: string[] = doc.splitTextToSize(`Registration - ${ticket.eventTitle}`, R - M - 45);
      doc.text(desc, M + 3, y);
      doc.text(amount, R - 3, y, { align: "right" });
      y += desc.length * 5 + 1;

      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.2);
      doc.line(M, y, R, y);
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...NAVY);
      doc.text("Total", M + 3, y);
      doc.text(amount, R - 3, y, { align: "right" });
      y += 4;

      // ---------- QR ----------
      section("Check-in");
      const qrSize = 38;
      doc.addImage(qr, "PNG", M, y - 2, qrSize, qrSize);
      const tx = M + qrSize + 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...NAVY);
      doc.text("Scan at the venue", tx, y + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      const note: string[] = doc.splitTextToSize(
        "Show this QR code at the entrance for check-in. Keep this pass on your phone or bring a printed copy.",
        R - tx
      );
      doc.text(note, tx, y + 13);
      doc.setFontSize(8);
      doc.text(`Registration ID: ${ticket.registrationId}`, tx, y + 13 + note.length * 4.5 + 4);

      // ---------- Footer ----------
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.2);
      doc.line(M, 284, R, 284);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text("Generated by YourClub - Built for the 9th DRMC International Tech Carnival 2026", W / 2, 290, {
        align: "center",
      });

      doc.save(`YourClub-EntryPass-${passNo}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Could not create the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
        {busy ? "Preparing pass..." : "Download Entry Pass"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}