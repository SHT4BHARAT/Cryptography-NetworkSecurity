// frontend/lib/analysis/insights.test.ts
import { describe, it, expect } from "vitest";
import { buildInsights } from "./insights";

describe("buildInsights", () => {
  const now = new Date();
  const thisKey = now.toISOString().slice(0, 7);
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

  it("flags top category and a big MoM increase", () => {
    const tx = [
      { date: `${thisKey}-10`, amount: -100, category: "Food & Dining" },
      { date: `${prevKey}-10`, amount: -50, category: "Food & Dining" },
      { date: `${thisKey}-11`, amount: -20, category: "Transport" },
    ];
    const insights = buildInsights(tx);
    expect(
      insights.some((i) => i.kind === "top-category" && i.category === "Food & Dining")
    ).toBe(true);
    expect(insights.some((i) => i.kind === "mom-trend" && i.changePercent >= 100)).toBe(true);
  });

  it("returns empty for no spending", () => {
    expect(buildInsights([])).toEqual([]);
  });
});