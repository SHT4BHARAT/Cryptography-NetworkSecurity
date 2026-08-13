// frontend/app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/validation/schemas";
import { categorizeByRules } from "@/lib/categorization/rules";
import { dedupeHash } from "@/lib/utils/csv";
import { rateLimit } from "@/lib/utils/rateLimit";

const WRITE_LIMIT = 120; // per minute
const PAGE_SIZE_MAX = 200;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = rateLimit(`tx:${user.id}`, WRITE_LIMIT);
  if (!limit.ok)
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );

  const parsed = transactionSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );

  const { date, amount, description, accountId } = parsed.data;
  const category = categorizeByRules(description, amount) ?? "Uncategorized";

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      account_id: accountId ?? null,
      date,
      amount,
      description,
      category,
      dedupe_hash: dedupeHash(user.id, date, amount, description),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ transaction: data }, { status: 201 });
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const month = url.searchParams.get("month");

  // Keyset pagination: `limit` (max PAGE_SIZE_MAX) plus an optional `before`
  // date cursor so large histories can be streamed in pages.
  const limit = Math.min(
    Math.max(1, Number(url.searchParams.get("limit") ?? 100) || 100),
    PAGE_SIZE_MAX
  );
  const before = url.searchParams.get("before"); // ISO date, exclusive

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(limit);

  if (before) query = query.lt("date", before);
  if (category) query = query.eq("category", category);
  if (month) {
    const next = new Date(`${month}-01T00:00:00Z`);
    next.setUTCMonth(next.getUTCMonth() + 1);
    query = query
      .gte("date", `${month}-01`)
      .lt("date", next.toISOString().slice(0, 10));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // The last row's date acts as the `before` cursor for the next page.
  const nextCursor =
    data && data.length === limit ? data[data.length - 1].date : null;

  return NextResponse.json({ transactions: data, nextCursor });
}