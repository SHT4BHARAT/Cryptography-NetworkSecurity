// frontend/app/(app)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { getDashboardService } from "@/lib/analysis/services";
import { HealthGauge } from "@/components/HealthGauge";
import { SpendingBreakdown } from "@/components/SpendingBreakdown";
import { InsightsList } from "@/components/InsightsList";
import { SubscriptionList } from "@/components/SubscriptionList";
import { TrendChart } from "@/components/TrendChart";
import { EmptyState } from "@/components/EmptyState";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Single consolidated fetch (transactions, profile income, budgets) so the
  // dashboard doesn't re-fetch the full transaction set three times.
  const data = await getDashboardService();
  const health = data?.health ?? null;
  const analyze = data?.analyze;
  const subscriptions = data?.subscriptions ?? [];

  const hasData = !!analyze?.breakdown?.length;
  const recommendations = health?.recommendations ?? [];

  return (
    <div className="space-y-8">
      {health ? (
        <HealthGauge
          score={health.score}
          month={health.month}
          savingsRate={health.savingsRate}
          spendingVsIncome={health.spendingVsIncome}
          budgetAdherence={health.budgetAdherence}
        />
      ) : (
        <EmptyState
          title="Health score unavailable"
          hint="Make sure you are logged in, then reload."
        />
      )}

      {recommendations.length > 0 && (
        <section className="panel">
          <h2 className="mb-3 font-display text-lg text-ink">Recommendations</h2>
          <ul className="divide-y divide-line">
            {recommendations.map((r, i) => (
              <li key={i} className="py-2.5 text-sm text-ink">
                {r}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasData ? (
        <EmptyState
          title="No transactions yet"
          hint="Add a transaction or upload a CSV statement to see your breakdown."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SpendingBreakdown breakdown={analyze!.breakdown} />
          <div className="space-y-6">
            <InsightsList insights={analyze!.insights} />
          </div>
          <div className="lg:col-span-2">
            <TrendChart series={analyze!.series ?? []} />
          </div>
        </div>
      )}

      {!subscriptions.length ? null : (
        <SubscriptionList subscriptions={subscriptions} />
      )}
    </div>
  );
}