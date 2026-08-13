"use client";
export function InsightsList({
  insights,
}: {
  insights: { kind?: string; category?: string; changePercent?: number; share?: number }[];
}) {
  const trends = insights.filter((i) => i.kind === "mom-trend");
  if (!trends.length) return null;
  return (
    <section className="panel">
      <h2 className="mb-4 font-display text-lg text-ink">Spending insights</h2>
      <ul className="divide-y divide-line">
        {trends.map((i, idx) => {
          const up = (i.changePercent ?? 0) >= 0;
          return (
            <li key={idx} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="text-ink">{i.category}</span>
              <span className={`figures font-medium ${up ? "text-debit" : "text-credit"}`}>
                {up ? "▲" : "▼"} {Math.abs(i.changePercent ?? 0)}% vs last month
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
