// frontend/components/HealthGauge.tsx
"use client";
export function HealthGauge({
  score,
  month,
  savingsRate,
  spendingVsIncome,
  budgetAdherence,
}: {
  score: number;
  month?: string;
  savingsRate?: number | null;
  spendingVsIncome?: number | null;
  budgetAdherence?: number | null;
}) {
  const color =
    score >= 70 ? "text-green-600" : score >= 40 ? "text-amber-600" : "text-red-600";
  const label = score >= 70 ? "Healthy" : score >= 40 ? "Needs attention" : "At risk";

  const stats: { label: string; value: string | null }[] = [
    { label: "Savings rate", value: savingsRate === null || savingsRate === undefined ? null : `${savingsRate}%` },
    { label: "Spending vs income", value: spendingVsIncome === null || spendingVsIncome === undefined ? null : `${spendingVsIncome}%` },
    { label: "Budget adherence", value: budgetAdherence === null || budgetAdherence === undefined ? null : `${budgetAdherence}%` },
  ];

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Financial Health</h1>
          <p className="text-sm text-neutral-500">
            {month ? `Month of ${month}` : "This month"}
          </p>
          <p className="mt-2 text-sm font-medium text-neutral-700">{label}</p>
        </div>
        <div className={`text-6xl font-bold ${color}`}>{score}</div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded border border-neutral-200 p-3">
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="mt-1 text-lg font-semibold text-neutral-900">
              {s.value ?? "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}