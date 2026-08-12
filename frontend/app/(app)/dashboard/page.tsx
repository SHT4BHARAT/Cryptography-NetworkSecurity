// frontend/app/(app)/dashboard/page.tsx
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { HealthGauge } from "@/components/HealthGauge";
import { SpendingBreakdown } from "@/components/SpendingBreakdown";
import { InsightsList } from "@/components/InsightsList";
import { SubscriptionList } from "@/components/SubscriptionList";
import { TrendChart } from "@/components/TrendChart";
import { EmptyState } from "@/components/EmptyState";

async function getApi<T>(path: string, cookieHeader: string): Promise<T | null> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? "http";
    const res = await fetch(`${proto}://${host}${path}`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieHeader = (await cookies()).toString();

  const [health, analyze, subs] = await Promise.all([
    getApi<{
      month: string;
      score: number;
      savingsRate: number | null;
      spendingVsIncome: number | null;
      budgetAdherence: number | null;
      recommendations: string[];
    }>("/api/health", cookieHeader),
    getApi<{
      insights: { kind: string; category: string; changePercent: number; share: number }[];
      breakdown: { category: string; amount: number; share: number }[];
      series: { month: string; spending: number; income: number }[];
    }>("/api/analyze", cookieHeader),
    getApi<{
      subscriptions: { merchant: string; amount: number; cadence: string; lastDetected: string }[];
    }>("/api/subscriptions", cookieHeader),
  ]);

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
        <section>
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Recommendations</h2>
          <ul className="space-y-2">
            {recommendations.map((r, i) => (
              <li key={i} className="rounded border bg-white p-3 text-sm text-neutral-700">
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

      {!subs?.subscriptions?.length ? null : (
        <SubscriptionList subscriptions={subs.subscriptions} />
      )}
    </div>
  );
}