// frontend/lib/analysis/insights.test.ts
import { describe, it, expect } from "vitest";
import { buildInsights, buildMonthlySeries } from "./insights";
import { monthKeyOf, shiftMonth } from "@/lib/utils/date";

describe("buildInsights", () => {
  const now = new Date();
  const thisKey = monthKeyOf(now);
  const prevKey = monthKeyOf(shiftMonth(now, -1));

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

describe("buildMonthlySeries", () => {
  it("groups income and spending by month, chronological", () => {
    const series = buildMonthlySeries([
      { date: "2026-01-05", amount: 3000, category: "Income" },
      { date: "2026-01-20", amount: -500, category: "Food & Dining" },
      { date: "2026-02-02", amount: -120, category: "Transport" },
    ]);
    expect(series).toEqual([
      { month: "2026-01", spending: 500, income: 3000 },
      { month: "2026-02", spending: 120, income: 0 },
    ]);
  });
});