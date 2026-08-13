// frontend/components/HealthGauge.tsx
"use client";
import { PulseLine } from "@/components/PulseLine";

const TIERS = [
  { min: 70, label: "Healthy", tone: "credit", jitter: 0.08, chip: "bg-credit/15 text-credit", text: "text-credit" },
  { min: 40, label: "Needs attention", tone: "brass", jitter: 0.35, chip: "bg-brass/15 text-brass", text: "text-brass" },
  { min: 0, label: "At risk", tone: "debit", jitter: 0.65, chip: "bg-debit/15 text-debit", text: "text-debit" },
] as const;

function tierFor(score: number) {
  return TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];
}

function fmtPct(v?: number | null) {
  return v === null || v === undefined ? null : `${v}%`;
}

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
  const tier = tierFor(score);

  const stats: { label: string; value: string | null }[] = [
    { label: "Savings rate", value: fmtPct(savingsRate) },
    { label: "Spending vs income", value: fmtPct(spendingVsIncome) },
    { label: "Budget adherence", value: fmtPct(budgetAdherence) },
  ];

  return (
    <div className="panel">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-ledger">
            {month ? `Month of ${month}` : "This month"}
          </p>
          <h1 className="font-display text-2xl text-ink">Financial health</h1>
          <span className={`mt-2 inline-block rounded-[3px] px-2 py-0.5 text-xs font-medium ${tier.chip}`}>
            {tier.label}
          </span>
        </div>
        <div className={`figures text-6xl font-medium ${tier.text}`}>{score}</div>
      </div>

      <div className="mt-6 h-14">
        <PulseLine tone={tier.tone} jitter={tier.jitter} />
      </div>

      <dl className="mt-4 divide-y divide-line">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between py-2.5 text-sm">
            <dt className="text-ledger">{s.label}</dt>
            <dd className="figures text-ink">{s.value ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
