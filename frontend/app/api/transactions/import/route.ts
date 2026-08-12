// frontend/app/api/transactions/import/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCsv, type ParsedRow } from "@/lib/utils/csv";
import { categorizeByRules } from "@/lib/categorization/rules";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  const { rows, hashes } = parseCsv(text, user.id);

  const existing = await supabase
    .from("transactions")
    .select("dedupe_hash")
    .in("dedupe_hash", hashes.length ? hashes : ["__none__"]);

  const existingSet = new Set((existing.data ?? []).map((t) => t.dedupe_hash));

  const validPairs = rows
    .map((row, i) => ({ row: row as Extract<ParsedRow, { ok: true }>, hash: hashes[i] }))
    .filter(({ hash }) => hash !== undefined && !existingSet.has(hash));

  const toInsert = validPairs.map(({ row, hash }) => ({
    user_id: user.id,
    date: row.date,
    amount: row.amount,
    description: row.description,
    category: categorizeByRules(row.description, row.amount) ?? "Uncategorized",
    dedupe_hash: hash,
  }));

  const errors = rows
    .filter((r) => r.ok === false)
    .map((r) => ({ line: (r as { line: number }).line, reason: (r as { reason: string }).reason }));

  const validCount = rows.filter((r) => r.ok === true).length;
  const skippedDuplicates = validCount - toInsert.length;

  const { error } = await supabase.from("transactions").insert(toInsert);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ imported: toInsert.length, skippedDuplicates, errors });
}