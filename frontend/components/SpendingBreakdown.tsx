// frontend/components/SpendingBreakdown.tsx
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

const PALETTE = [
  "#2563eb",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#f97316",
  "#64748b",
];

export function SpendingBreakdown({
  breakdown,
}: {
  breakdown: { category: string; amount: number; share: number }[];
}) {
  if (!breakdown.length)
    return (
      <p className="text-sm text-neutral-500">
        Add transactions to see your spending breakdown.
      </p>
    );

  return (
    <section className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">
        Spending breakdown
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={breakdown} layout="vertical" margin={{ left: 8, right: 24 }}>
          <XAxis type="number" unit="%" domain={[0, 100]} />
          <YAxis
            type="category"
            dataKey="category"
            width={128}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Bar dataKey="share" radius={[0, 4, 4, 0]}>
            {breakdown.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}