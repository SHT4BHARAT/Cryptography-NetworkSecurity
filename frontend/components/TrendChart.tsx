// frontend/components/TrendChart.tsx
"use client";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export function TrendChart({
  series,
}: {
  series: { month: string; spending: number; income: number }[];
}) {
  if (!series.length)
    return (
      <p className="text-sm text-neutral-500">
        Add transactions to see your month-over-month trend.
      </p>
    );

  return (
    <section className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">
        Monthly spending vs income
      </h2>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={series} margin={{ left: 8, right: 16 }}>
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="spending" name="Spending" fill="#2563eb" radius={[4, 4, 0, 0]} />
          <Line
            dataKey="income"
            name="Income"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </section>
  );
}