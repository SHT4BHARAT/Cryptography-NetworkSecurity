"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Same tonal family as the app palette (sage/brass/clay) instead of a
// generic rainbow, so the chart still reads as part of the ledger.
const PALETTE = [
  "#2F7A4F",
  "#A9793C",
  "#5B6B5A",
  "#7A9E7E",
  "#B4432E",
  "#C98A52",
  "#3F6B5E",
  "#8C6239",
  "#94A08C",
];

export function SpendingBreakdown({
  breakdown,
}: {
  breakdown: { category: string; amount: number; share: number }[];
}) {
  if (!breakdown.length)
    return (
      <p className="text-sm text-ledger">
        Add transactions to see your spending breakdown.
      </p>
    );

  return (
    <section className="panel">
      <h2 className="mb-4 font-display text-lg text-ink">Spending breakdown</h2>
      <div
        role="img"
        aria-label="Horizontal bar chart of spending percentage by category"
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={breakdown} layout="vertical" margin={{ left: 8, right: 24 }}>
            <XAxis type="number" unit="%" domain={[0, 100]} tick={{ fill: "#5B6B5A", fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="category"
              width={128}
              tick={{ fill: "#5B6B5A", fontSize: 12 }}
            />
            <Tooltip />
            <Bar dataKey="share" name="Share of spending" radius={[0, 3, 3, 0]}>
              {breakdown.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
