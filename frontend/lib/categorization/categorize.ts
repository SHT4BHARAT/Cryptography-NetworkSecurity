// frontend/lib/categorization/categorize.ts
import { CATEGORIES, categorizeByRules, mapLlmCategory, type Category } from "./rules";

type LlmRow = { id: string; description: string };

export async function categorizeBatch(
  rows: { id: string; description: string; amount: number }[]
): Promise<Map<string, Category>> {
  const map = new Map<string, Category>();
  const unresolved: LlmRow[] = [];

  for (const row of rows) {
    const byRules = categorizeByRules(row.description, row.amount);
    if (byRules) map.set(row.id, byRules);
    else unresolved.push({ id: row.id, description: row.description });
  }

  if (unresolved.length > 0) {
    try {
      const llm = await llmCategorize(unresolved.map((r) => r.description));
      unresolved.forEach((row, i) => map.set(row.id, mapLlmCategory(llm[i] ?? "")));
    } catch {
      // LLM is off the critical path: never throw; rows fall back to Uncategorized
    }
  }
  return map;
}

async function llmCategorize(descriptions: string[]): Promise<string[]> {
  const key = process.env.LLM_API_KEY;
  const base = process.env.LLM_BASE_URL;
  if (!key || !base || descriptions.length === 0) return [];

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      model: process.env.LLM_MODEL ?? "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            `Classify each financial transaction description into exactly one of: ${CATEGORIES.join(", ")}. ` +
            `Return JSON {"categories":["cat1","cat2",...]} matching input order. Only use the listed categories.`,
        },
        { role: "user", content: JSON.stringify(descriptions) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}`);
  const data: { choices?: { message?: { content?: string } }[] } = await res.json();
  const parsed: { categories?: string[] } = JSON.parse(
    data.choices?.[0]?.message?.content ?? "{}"
  );
  return parsed.categories ?? [];
}