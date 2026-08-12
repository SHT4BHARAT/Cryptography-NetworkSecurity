// frontend/lib/analysis/insights.ts
export type Tx = { date: string; amount: number; category: string };
export type Insight =
  | { kind: "top-category"; category: string; share: number }
  | { kind: "mom-trend"; category: string; changePercent: number }
  | { kind: "spike"; category: string; changePercent: number };

export function buildInsights(transactions: Tx[]): Insight[] {
  const now = new Date();
  const thisKey = now.toISOString().slice(0, 7);
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

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