// frontend/lib/analysis/insights.ts
import { monthKeyOf, shiftMonth } from "@/lib/utils/date";

export type Tx = { date: string; amount: number; category: string };
export type Insight =
  | { kind: "top-category"; category: string; share: number }
  | { kind: "mom-trend"; category: string; changePercent: number }
  | { kind: "spike"; category: string; changePercent: number };

export type CategoryBreakdown = { category: string; amount: number; share: number };

export type MonthPoint = { month: string; spending: number; income: number };

export function buildMonthlySeries(transactions: Tx[]): MonthPoint[] {
  const byMonth = new Map<string, { spending: number; income: number }>();
  for (const t of transactions) {
    const key = t.date.slice(0, 7);
    const row = byMonth.get(key) ?? { spending: 0, income: 0 };
    if (t.amount < 0) row.spending += Math.abs(Number(t.amount));
    else row.income += Number(t.amount);
    byMonth.set(key, row);
  }
  return [...byMonth.entries()]
    .map(([month, { spending, income }]) => ({
      month,
      spending: Math.round(spending * 100) / 100,
      income: Math.round(income * 100) / 100,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function buildCategoryBreakdown(transactions: Tx[]): CategoryBreakdown[] {
  const spending = transactions.filter((t) => t.amount < 0);
  const total = Math.abs(spending.reduce((s, t) => s + Number(t.amount), 0));
  if (total === 0) return [];
  const byCat = new Map<string, number>();
  for (const t of spending)
    byCat.set(t.category, (byCat.get(t.category) ?? 0) + Math.abs(Number(t.amount)));
  return [...byCat.entries()]
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      share: Math.round((amount / total) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function buildInsights(transactions: Tx[]): Insight[] {
  const now = new Date();
  const thisKey = monthKeyOf(now);
  const prevKey = monthKeyOf(shiftMonth(now, -1));

  const spending = transactions.filter((t) => t.amount < 0);
  const total = Math.abs(spending.reduce((s, t) => s + Number(t.amount), 0));
  if (total === 0) return [];

  const insights: Insight[] = [];

  const byCat = new Map<string, number>();
  for (const t of spending)
    byCat.set(t.category, (byCat.get(t.category) ?? 0) + Math.abs(Number(t.amount)));
  const sorted = [...byCat.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted[0])
    insights.push({
      kind: "top-category",
      category: sorted[0][0],
      share: Math.round((sorted[0][1] / total) * 100),
    });

  const mom = new Map<string, { this: number; prev: number }>();
  for (const t of spending) {
    const key = t.date.slice(0, 7);
    const row = mom.get(t.category) ?? { this: 0, prev: 0 };
    if (key === thisKey) row.this += Math.abs(Number(t.amount));
    if (key === prevKey) row.prev += Math.abs(Number(t.amount));
    mom.set(t.category, row);
  }
  for (const [category, { this: cur, prev: pv }] of mom) {
    if (pv > 0 && cur > pv * 1.25) {
      insights.push({
        kind: "mom-trend",
        category,
        changePercent: Math.round((cur / pv - 1) * 100),
      });
    } else if (pv > 0 && cur < pv * 0.5) {
      insights.push({
        kind: "mom-trend",
        category,
        changePercent: Math.round((cur / pv - 1) * 100),
      });
    }
  }
  return insights.slice(0, 5);
}