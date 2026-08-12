// frontend/app/(app)/health/page.tsx
"use client";
import { useEffect, useState } from "react";
import { HealthGauge } from "@/components/HealthGauge";
import { SubscriptionList } from "@/components/SubscriptionList";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";

type Health = {
  month: string;
  score: number;
  savingsRate: number | null;
  spendingVsIncome: number | null;
  budgetAdherence: number | null;
  recommendations: string[];
};

type Subs = {
  subscriptions: { merchant: string; amount: number; cadence: string; lastDetected: string }[];
};

export default function HealthPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [subs, setSubs] = useState<Subs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      try {
        const [hRes, sRes] = await Promise.all([
          fetch("/api/health", { cache: "no-store" }),
          fetch("/api/subscriptions", { cache: "no-store" }),
        ]);
        if (!hRes.ok) throw new Error(await hRes.json().then((d) => d?.error).catch(() => "Failed to load health score"));
        const [hData, sData] = await Promise.all([hRes.json(), sRes.ok ? sRes.json() : Promise.resolve({ subscriptions: [] })]);
        if (!cancelled) {
          setHealth(hData as Health);
          setSubs(sData as Subs);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-neutral-900">Financial health</h1>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : !health ? (
        <EmptyState
          title="Health score unavailable"
          hint="Add transactions and income to see your score."
        />
      ) : (
        <>
          <HealthGauge
            score={health.score}
            month={health.month}
            savingsRate={health.savingsRate}
            spendingVsIncome={health.spendingVsIncome}
            budgetAdherence={health.budgetAdherence}
          />

          {health.recommendations.length > 0 && (
            <section className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-neutral-900">Recommendations</h2>
              <ul className="space-y-2">
                {health.recommendations.map((r, i) => (
                  <li key={i} className="rounded border p-3 text-sm text-neutral-700">
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!health.recommendations.length && (
            <EmptyState
              title="Score could not be calculated"
              hint="Add income (positive amount) or set a monthly income in your profile, then reload."
            />
          )}

          {subs?.subscriptions ? (
            <SubscriptionList subscriptions={subs.subscriptions} />
          ) : null}
        </>
      )}
    </div>
  );
}