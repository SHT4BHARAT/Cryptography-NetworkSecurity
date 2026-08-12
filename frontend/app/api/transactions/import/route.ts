// frontend/app/api/transactions/import/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCsv } from "@/lib/utils/csv";
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
  const { rows } = parseCsv(text, user.id);

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

  const { error } = await supabase.from("transactions").insert(toInsert);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ imported: toInsert.length, skippedDuplicates, errors });
}