// frontend/app/api/categorize/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { categorizeBatch } from "@/lib/categorization/categorize";
import { rateLimit } from "@/lib/utils/rateLimit";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = rateLimit(`categorize:${user.id}`, 30);
  if (!limit.ok)
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );

  const { data: trx, error } = await supabase
    .from("transactions")
    .select("id, user_id, date, amount, description, dedupe_hash, created_at")
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
  const updates = [...map.entries()].filter(
    ([id, cat]) => cat !== "Uncategorized" && ids.has(id)
  );

  if (updates.length) {
    const updatePromises = updates.map(([id, category]) =>
      supabase
        .from("transactions")
        .update({ category })
        .eq("id", id)
        .eq("user_id", user.id)
    );
    const results = await Promise.all(updatePromises);
    const firstErr = results.find((r) => r.error);
    if (firstErr?.error)
      return NextResponse.json({ error: firstErr.error.message }, { status: 400 });
  }
  return NextResponse.json({ updated: updates.length });
}