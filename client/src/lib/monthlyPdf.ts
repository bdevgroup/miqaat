import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DateTime } from 'luxon';
import {
  PRAYER_ORDER, type PrayerTimesResponse, type SavedLocation, type AppSettings,
  CALCULATION_METHODS,
} from '@/types';
import { formatTime } from '@/lib/time';

/**
 * Generate the Miqaat-branded monthly calendar as a real PDF (vector text,
 * selectable, printable). Uses jsPDF's standard fonts (Helvetica/Times/
 * Courier) only — no custom font embedding — so output stays small.
 *
 * STRICT ASCII RULE: every string written into the PDF must use only chars
 * in WinAnsi-1252. Standard PDF fonts have no Unicode coverage; characters
 * like the 'a' macron, the U+02BB modifier letter Intl uses for "Dhu'l-Q.",
 * or curly quotes will corrupt cell rendering and break column alignment.
 *
 * Brand cues that need non-ASCII glyphs (the macron over the 'a', the
 * Miqaat name's 'a' accent) are drawn manually as primitives via
 * doc.line() / doc.rect(). See drawHeader() below.
 */
export interface MonthlyPdfInput {
  anchor: DateTime;
  rows: string[];
  byDate: Map<string, PrayerTimesResponse>;
  settings: AppSettings;
  location: SavedLocation;
  hijriByDate: Map<string, string>;
  timeFormat: '12h' | '24h';
  tz?: string;
}

const AMBER = [180, 128, 63] as [number, number, number];     // hsl(33 51% 47%)
const INK = [26, 26, 26] as [number, number, number];
const SUBTLE = [110, 110, 110] as [number, number, number];
const FRIDAY_TINT = [253, 246, 232] as [number, number, number]; // pale amber

/**
 * Hand-coded Hijri month names (ASCII). Avoids Intl.DateTimeFormat's
 * locale-dependent abbreviations which use U+02BB / U+02BC modifier
 * letters that aren't in WinAnsi.
 */
const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi I', 'Rabi II',
  'Jumada I', 'Jumada II', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul-Qadah', 'Dhul-Hijjah',
];

/** Format a Gregorian ISO date as a Hijri label using only ASCII characters. */
export function formatHijriAscii(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  // The 'nu-latn' extension forces Latin numerals (otherwise some locales
  // produce Arabic-Indic digits which aren't in WinAnsi either).
  const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
    day: 'numeric', month: 'numeric', year: 'numeric',
  }).formatToParts(d);
  const day = parts.find((p) => p.type === 'day')?.value ?? '?';
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? 0);
  const year = parts.find((p) => p.type === 'year')?.value ?? '?';
  const monthName = HIJRI_MONTHS[month - 1] ?? '?';
  return `${day} ${monthName} ${year}`;
}

export function generateMonthlyPdf({
  anchor, rows, byDate, settings, location, hijriByDate, timeFormat, tz,
}: MonthlyPdfInput): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  drawHeader(doc, margin, pageWidth);
  let cursorY = drawMeta(doc, margin, contentWidth, 38, {
    anchor, settings, location, hijriByDate, tz,
  });

  cursorY += 4;

  const head = [['Date', 'Day', 'Hijri', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']];
  const body = rows.map((d) => {
    const row = byDate.get(d);
    const dt = DateTime.fromISO(d);
    return [
      dt.toFormat('dd LLL'),
      dt.toFormat('ccc'),
      hijriByDate.get(d) ?? '-',
      ...PRAYER_ORDER.map((p) => (row ? formatTime(row[p], timeFormat, tz) : '-')),
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: { top: 1.6, bottom: 1.6, left: 2, right: 2 },
      textColor: INK,
      lineColor: [220, 220, 220],
      lineWidth: 0,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [248, 245, 240],
      textColor: SUBTLE,
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
      lineWidth: { bottom: 0.4 },
      lineColor: INK,
    },
    bodyStyles: {
      lineWidth: { bottom: 0.15 },
      lineColor: [225, 225, 225],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 18 },                       // Date
      1: { textColor: SUBTLE, cellWidth: 12 },                        // Day
      2: { textColor: SUBTLE, fontSize: 7.5, cellWidth: 38 },         // Hijri (wider for "Dhul-Hijjah 1447")
      3: { halign: 'right', font: 'courier' },                        // Fajr
      4: { halign: 'right', font: 'courier' },                        // Sunrise
      5: { halign: 'right', font: 'courier' },                        // Dhuhr
      6: { halign: 'right', font: 'courier' },                        // Asr
      7: { halign: 'right', font: 'courier' },                        // Maghrib
      8: { halign: 'right', font: 'courier' },                        // Isha
    },
    didParseCell: (data) => {
      // Friday tint: paint the entire row pale amber when day-name cell == "Fri"
      if (data.section === 'body' && data.row.raw && Array.isArray(data.row.raw)) {
        const dayCell = (data.row.raw as string[])[1];
        if (dayCell === 'Fri') {
          data.cell.styles.fillColor = FRIDAY_TINT;
        }
      }
    },
    didDrawPage: () => drawFooter(doc, margin, pageWidth),
  });

  return doc;
}

/* -------------------------------------------------------------------------- */

function drawHeader(doc: jsPDF, margin: number, pageWidth: number): void {
  doc.setFont('times', 'italic');
  doc.setFontSize(28);
  doc.setTextColor(...INK);

  const wmY = 22;
  const partMiq = 'miq';
  const partA = 'a';
  const partT = 't';

  doc.text(partMiq, margin, wmY);
  const miqW = doc.getTextWidth(partMiq);

  const aX = margin + miqW;
  doc.setTextColor(...AMBER);
  doc.text(partA, aX, wmY);
  const aW = doc.getTextWidth(partA);

  // Manual macron: a short amber bar above the 'a'. The italic 'a' slants
  // up-right, so we nudge the bar slightly right to sit visually centred
  // over the letter rather than the bounding box.
  doc.setDrawColor(...AMBER);
  doc.setLineWidth(0.9);
  const macronInset = aW * 0.12;
  const macronY = wmY - 8;
  const macronShift = 1.4;
  doc.line(
    aX + macronInset + macronShift, macronY,
    aX + aW - macronInset + macronShift, macronY,
  );

  doc.setTextColor(...INK);
  doc.text(partT, aX + aW, wmY);

  // Tagline next to the wordmark, baseline-aligned
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...SUBTLE);
  const taglineX = aX + aW + doc.getTextWidth(partT) + 6;
  doc.text('an appointed time', taglineX, wmY - 0.5);

  // Top-right small URL
  doc.setFontSize(8);
  doc.text('miqaaat.com', pageWidth - margin, wmY - 4, { align: 'right' });

  // Underline beneath the wordmark
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.6);
  doc.line(margin, 28, pageWidth - margin, 28);
}

function drawMeta(
  doc: jsPDF,
  margin: number,
  contentWidth: number,
  startY: number,
  ctx: {
    anchor: DateTime;
    settings: AppSettings;
    location: SavedLocation;
    hijriByDate: Map<string, string>;
    tz?: string;
  },
): number {
  const { anchor, settings, location, hijriByDate, tz } = ctx;
  const method =
    CALCULATION_METHODS.find((m) => m.id === settings.calc_method)?.name ??
    settings.calc_method;
  const madhab = settings.madhab === '0' ? 'Shafi / Maliki / Hanbali' : 'Hanafi';

  // ASCII-safe location: avoid the centre-dot from the on-screen UI.
  const locStr =
    `${asciiSafe(location.city)}` +
    (location.country ? `, ${asciiSafe(location.country)}` : '') +
    `  -  ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}` +
    (tz ? `  -  ${tz}` : '');
  const monthStr =
    anchor.toFormat('LLLL yyyy') +
    (hijriByDate.get(anchor.toISODate() ?? '')
      ? `  -  ${hijriByDate.get(anchor.toISODate() ?? '')}`
      : '');

  const lines: Array<[string, string]> = [
    ['Location', locStr],
    ['Method', `${asciiSafe(method)}  -  ${madhab}`],
    ['Month', monthStr],
  ];

  doc.setFontSize(8.5);
  let y = startY;
  for (const [label, value] of lines) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SUBTLE);
    doc.text(label.toUpperCase(), margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...INK);
    const valueLines = doc.splitTextToSize(value, contentWidth - 22);
    doc.text(valueLines, margin + 22, y);
    y += 4.6 * Math.max(1, valueLines.length);
  }
  return y;
}

function drawFooter(doc: jsPDF, margin: number, pageWidth: number): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  const y = pageHeight - 8;
  doc.setDrawColor(225, 225, 225);
  doc.setLineWidth(0.2);
  doc.line(margin, y - 2, pageWidth - margin, y - 2);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...SUBTLE);
  // ASCII-only — no 'ā' in footer, no centre-dot.
  const generated = `Generated by Miqaat  -  ${DateTime.now().toFormat('yyyy-LL-dd HH:mm')}`;
  doc.text(generated, pageWidth - margin, y, { align: 'right' });

  const pageNum = (doc as unknown as { getNumberOfPages: () => number })
    .getNumberOfPages();
  doc.text(`page ${pageNum}`, margin, y);
}

/**
 * Strip non-WinAnsi characters from user-supplied text (location names from
 * Aladhan can be in many scripts). Latin Extended characters get folded to
 * their basic Latin form via NFD-normalize-then-strip-marks; everything
 * else falls through unchanged so cities like "Casablanca" survive but
 * "Düsseldorf" becomes "Dusseldorf" and Arabic place names get stripped to
 * empty (the user can re-search for the Latin transliteration).
 */
function asciiSafe(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // strip combining marks
    // Replace common typographic punctuation with ASCII fallbacks
    .replace(/[‘’ʻʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/·/g, '-')           // middle dot
    .replace(/»/g, '"')
    .replace(/«/g, '"');
}

/** Build a sensible filename — `miqaat-2026-04-Casablanca.pdf`. */
export function suggestedFilename(anchor: DateTime, location: SavedLocation): string {
  const slug = (location.city || 'location')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `miqaat-${anchor.toFormat('yyyy-LL')}-${slug}.pdf`;
}
