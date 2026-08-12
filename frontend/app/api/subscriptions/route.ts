// frontend/app/api/subscriptions/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectSubscriptions } from "@/lib/analysis/subscriptions";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  return NextResponse.json({ subscriptions: subs });
}