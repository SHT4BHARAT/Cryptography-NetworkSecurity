// frontend/lib/utils/date.ts
// Local-time helpers. All "current month" / "current date" keys elsewhere in
// the app must use these; toISOString() is UTC and can shift the month near
// month boundaries.

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function dateKeyOf(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function monthKeyOf(d: Date): string {
  return dateKeyOf(d).slice(0, 7);
}

export function shiftMonth(d: Date, delta: number): Date {
  const out = new Date(d.getFullYear(), d.getMonth() + delta, 1);
  return out;
}

export function currentMonthKey(): string {
  return monthKeyOf(new Date());
}

export function currentDateKey(): string {
  return dateKeyOf(new Date());
}