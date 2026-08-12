// frontend/app/api/categorize/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { categorizeBatch } from "@/lib/categorization/categorize";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trx, error } = await supabase
    .from("transactions")
    .select("id, description, amount")
    .eq("user_id", user.id)
    .eq("category", "Uncategorized")
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!trx?.length) return NextResponse.json({ updated: 0 });

  const map = await categorizeBatch(
    trx.map((t) => ({
      id: t.id,
      description: t.description,
      amount: Number(t.amount),
    }))
  );

  const ids = new Set(trx.map((t) => t.id));
  const updates = [...map.entries()]
    .filter(([id, cat]) => cat !== "Uncategorized" && ids.has(id))
    .map(([id, category]) => ({ id, category }));

  if (updates.length) {
    await supabase.from("transactions").upsert(updates, { onConflict: "id" });
  }
  return NextResponse.json({ updated: updates.length });
}