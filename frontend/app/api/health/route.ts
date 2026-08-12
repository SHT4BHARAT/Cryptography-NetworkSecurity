// frontend/app/api/health/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeScore } from "@/lib/analysis/score";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const month = new Date().toISOString().slice(0, 7);
  const [profileRes, trxRes, budgetRes] = await Promise.all([
    supabase.from("profiles").select("monthly_income").eq("user_id", user.id).single(),
    supabase.from("transactions").select("amount, date, category").eq("user_id", user.id),
    supabase
      .from("budgets")
      .select("amount, category")
      .eq("user_id", user.id)
      .eq("month", `${month}-01`),
  ]);

  const trx = trxRes.data ?? [];
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

  const prev = new Date();
  prev.setMonth(prev.getMonth() - 1);
  const prevKey = prev.toISOString().slice(0, 7);
  const prevSpending = Math.abs(
    trx
      .filter((t) => t.amount < 0 && t.date.startsWith(prevKey))
      .reduce((s, t) => s + Number(t.amount), 0)
  );

  const result = computeScore({
    income: totalIncome,
    spending,
    budgeted,
    spentOnBudgeted,
    prevMonthSpending: prevSpending || null,
  });

  await supabase.from("health_snapshots").upsert({
    user_id: user.id,
    month: `${month}-01`,
    score: result.score,
    breakdown: result,
  });

  return NextResponse.json({ month, ...result });
}