// frontend/lib/analysis/subscriptions.ts
export type Tx = { description: string; amount: number; date: string };
export type Subscription = {
  merchant: string;
  amount: number;
  cadence: "monthly";
  occurrences: number;
  lastDetected: string;
};

export function detectSubscriptions(
  transactions: Tx[],
  minOccurrences = 3
): Subscription[] {
  const groups = new Map<string, { amount: number; dates: string[]; merchant: string }>();
  for (const t of transactions.filter((t) => t.amount < 0)) {
    const desc = t.description.trim().toLowerCase();
    const merchant = desc.split(" ").slice(0, 3).join(" ");
    const key = `${merchant}|${t.amount.toFixed(2)}`;
    const group = groups.get(key) ?? { amount: t.amount, dates: [], merchant };
    group.dates.push(t.date);
    groups.set(key, group);
  }
  const result: Subscription[] = [];
  for (const g of groups.values()) {
    if (g.dates.length < minOccurrences) continue;
    const sorted = g.dates.sort();
    const spans: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const days =
        (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
      spans.push(days);
    }
    const avg = spans.reduce((a, b) => a + b, 0) / spans.length;
    if (avg >= 25 && avg <= 35) {
      result.push({
        merchant: g.merchant,
        amount: Math.abs(g.amount),
        cadence: "monthly",
        occurrences: g.dates.length,
        lastDetected: sorted[sorted.length - 1],
      });
    }
  }
  return result;
}