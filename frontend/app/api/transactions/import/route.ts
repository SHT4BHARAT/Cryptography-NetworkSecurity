// frontend/app/api/transactions/import/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCsv } from "@/lib/utils/csv";
import { categorizeByRules } from "@/lib/categorization/rules";
import { rateLimit } from "@/lib/utils/rateLimit";

// Hard safety limits so one upload can't spike memory or CPU (DoS guard).
const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5 MiB
const MAX_IMPORT_ROWS = 10_000;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_IMPORTS = 10;

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = rateLimit(`import:${user.id}`, RATE_MAX_IMPORTS, RATE_WINDOW_MS);
  if (!limit.ok)
    return NextResponse.json(
      { error: "Too many imports. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "No file" }, { status: 400 });

  if (file.size > MAX_IMPORT_BYTES)
    return NextResponse.json(
      { error: `File too large (max ${MAX_IMPORT_BYTES / (1024 * 1024)} MiB)` },
      { status: 413 }
    );

  const text = await file.text();
  const parsed = parseCsv(text, user.id);

  const rows = parsed.rows.slice(0, MAX_IMPORT_ROWS);
  const truncated = parsed.rows.length > MAX_IMPORT_ROWS;

  const validRows = rows.filter((r) => r.ok === true);
  const badRows = rows.filter((r) => r.ok === false);

  const hashes = validRows.map((r) => (r as { hash: string }).hash);

  const existing = await supabase
    .from("transactions")
    .select("dedupe_hash")
    .in("dedupe_hash", hashes.length ? hashes : ["__none__"]);

  const existingSet = new Set((existing.data ?? []).map((t) => t.dedupe_hash));

  const toInsert = validRows
    .filter((row) => !existingSet.has((row as { hash: string }).hash))
    .map((row) => ({
      user_id: user.id,
      date: row.date,
      amount: row.amount,
      description: row.description,
      category: categorizeByRules(row.description, row.amount) ?? "Uncategorized",
      dedupe_hash: (row as { hash: string }).hash,
    }));

  const errors = badRows.map((r) => ({
    line: (r as { line: number }).line,
    reason: (r as { reason: string }).reason,
  }));

  const skippedDuplicates = validRows.length - toInsert.length;

  if (toInsert.length > 0) {
    const { error } = await supabase.from("transactions").insert(toInsert);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    imported: toInsert.length,
    skippedDuplicates,
    truncated,
    errors,
  });
}