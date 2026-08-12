// frontend/components/InsightsList.tsx
"use client";
export function InsightsList({
  insights,
}: {
  insights: { kind?: string; category?: string; changePercent?: number; share?: number }[];
}) {
  const trends = insights.filter((i) => i.kind === "mom-trend");
  if (!trends.length) return null;
  return (
    <section className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">Spending insights</h2>
      <ul className="space-y-2">
        {trends.map((i, idx) => {
          const up = (i.changePercent ?? 0) >= 0;
          return (
            <li
              key={idx}
              className="flex items-center justify-between gap-3 rounded border p-3 text-sm"
            >
              <span className="text-neutral-700">{i.category}</span>
              <span
                className={`font-medium ${up ? "text-red-600" : "text-green-600"}`}
              >
                {up ? "▲" : "▼"} {Math.abs(i.changePercent ?? 0)}% vs last month
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}