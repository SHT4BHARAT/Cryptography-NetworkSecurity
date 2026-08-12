// frontend/app/api/analyze/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildInsights } from "@/lib/analysis/insights";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabase
    .from("transactions")
    .select("date, amount, category")
    .eq("user_id", user.id);

  return NextResponse.json({
    insights: buildInsights(
      (data ?? []).map((t) => ({
        date: t.date,
        amount: Number(t.amount),
        category: t.category,
      }))
    ),
  });
}