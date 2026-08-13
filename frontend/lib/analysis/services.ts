// frontend/lib/analysis/services.ts
import { createClient } from "@/lib/supabase/server";
import { computeScore, type ScoreResult } from "@/lib/analysis/score";
import {
  buildInsights,
  buildCategoryBreakdown,
  buildMonthlySeries,
  type Insight,
  type CategoryBreakdown,
  type MonthPoint,
} from "@/lib/analysis/insights";
import { detectSubscriptions, type Subscription } from "@/lib/analysis/subscriptions";
import { monthKeyOf, shiftMonth } from "@/lib/utils/date";

export type HealthData = { month: string } & ScoreResult;

export type AnalyzeData = {
  insights: Insight[];
  breakdown: CategoryBreakdown[];
  series: MonthPoint[];
};

export type SubscriptionsData = {
  subscriptions: Subscription[];
};

export async function getHealthService(): Promise<HealthData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date();
  const month = monthKeyOf(now);
  const prevMonth = monthKeyOf(shiftMonth(now, -1));

  const [profileRes, trxRes, budgetRes] = await Promise.all([
    supabase.from("profiles").select("monthly_income").eq("user_id", user.id).maybeSingle(),
    supabase.from("transactions").select("amount, date, category").eq("user_id", user.id),
    supabase.from("budgets").select("amount, category").eq("user_id", user.id).eq("month", `${month}-01`),
  ]);

  const trx = (trxRes.data ?? []).filter((t) => t.date.startsWith(month));
  const income = profileRes.data?.monthly_income ?? 0;
  const actualIncome = trx.filter((t) => t.amount > 0).reduce((s, t) => s + Number(t.amount), 0);
  const totalIncome = Math.max(Number(income), actualIncome);
  const spending = Math.abs(trx.filter((t) => t.amount < 0).reduce((s, t) => s + Number(t.amount), 0));
  const budgeted = (budgetRes.data ?? []).reduce((s, b) => s + Number(b.amount), 0);
  const spentOnBudgeted = (budgetRes.data ?? []).reduce(
    (s, b) =>
      s +
      Math.abs(
        trx
          .filter((t) => t.category === b.category && t.amount < 0)
          .reduce((x, t) => x + Number(t.amount), 0)
      ),
    0
  );

  const allTrx = trxRes.data ?? [];
  const prevSpending = Math.abs(
    allTrx
      .filter((t) => t.amount < 0 && t.date.startsWith(prevMonth))
      .reduce((s, t) => s + Number(t.amount), 0)
  );

  const result = computeScore({
    income: totalIncome,
    spending,
    budgeted,
    spentOnBudgeted,
    prevMonthSpending: prevSpending || null,
  });

  return { month, ...result };
}

export async function getAnalyzeService(): Promise<AnalyzeData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("transactions")
    .select("date, amount, category")
    .eq("user_id", user.id);

  const tx = (data ?? []).map((t) => ({
    date: t.date,
    amount: Number(t.amount),
    category: t.category,
  }));

  return {
    insights: buildInsights(tx),
    breakdown: buildCategoryBreakdown(tx),
    series: buildMonthlySeries(tx),
  };
}

export async function getSubscriptionsService(): Promise<SubscriptionsData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("transactions")
    .select("description, amount, date")
    .eq("user_id", user.id);

  const subs = detectSubscriptions(
    (data ?? []).map((t) => ({
      description: t.description,
      amount: Number(t.amount),
      date: t.date,
    }))
  );

  return { subscriptions: subs };
}
