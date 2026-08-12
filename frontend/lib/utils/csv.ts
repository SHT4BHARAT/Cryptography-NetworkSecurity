// frontend/lib/utils/csv.ts
import { parse } from "papaparse";
import crypto from "crypto";

export type ParsedRow =
  | { ok: true; date: string; amount: number; description: string }
  | { ok: false; line: number; reason: string };

export function parseDate(value: string): string | null {
  const s = String(value).trim().replace(/\./g, "-").replace(/\//g, "-");
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

export function normalizeAmount(value: unknown): number | null {
  const n = Number(String(value).replace(/[,$\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function dedupeHash(
  userId: string,
  date: string,
  amount: number,
  description: string
): string {
  const s = `${userId}|${date}|${amount.toFixed(2)}|${description
    .trim()
    .toLowerCase()}`;
  return crypto.createHash("sha256").update(s).digest("hex");
}

function headerLooksLikeHeader(cols: (string | undefined)[]): boolean {
  return cols.some((c) =>
    /date|description|amount|merchant|transaction/i.test(String(c ?? ""))
  );
}

export function parseCsv(
  text: string,
  userId: string
): { rows: ParsedRow[]; hashes: string[] } {
  const result = parse<string[]>(text, { skipEmptyLines: true });
  const rows: ParsedRow[] = [];
  const hashes: string[] = [];
  (result.data as string[][]).forEach((cols, idx) => {
    const line = idx + 2; // 1-based incl. header
    if (cols.length < 3) return; // tolerate blank junk rows
    const [dateRaw, desc, amountRaw, ...rest] = cols;
    if (idx === 0 && headerLooksLikeHeader([dateRaw, desc, amountRaw])) return;
    if (!dateRaw && !desc && !amountRaw) return;
    const date = parseDate(dateRaw);
    const amount = normalizeAmount(amountRaw);
    const description = String(desc || "").trim();
    if (!date)
      return rows.push({ ok: false, line, reason: `Unrecognized date: "${dateRaw}"` });
    if (amount === null)
      return rows.push({ ok: false, line, reason: `Invalid amount: "${amountRaw}"` });
    if (!description)
      return rows.push({ ok: false, line, reason: "Missing description" });
    const hash = dedupeHash(userId, date, amount, description);
    rows.push({ ok: true, date, amount, description });
    hashes.push(hash);
  });
  return { rows, hashes };
}