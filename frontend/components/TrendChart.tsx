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
      <p className="text-sm text-ledger">
        Add transactions to see your month-over-month trend.
      </p>
    );

  return (
    <section className="panel">
      <h2 className="mb-4 font-display text-lg text-ink">Monthly spending vs income</h2>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={series} margin={{ left: 8, right: 16 }}>
          <XAxis dataKey="month" tick={{ fill: "#5B6B5A", fontSize: 12 }} />
          <YAxis tick={{ fill: "#5B6B5A", fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="spending" name="Spending" fill="#B4432E" radius={[3, 3, 0, 0]} />
          <Line
            dataKey="income"
            name="Income"
            stroke="#2F7A4F"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </section>
  );
}
