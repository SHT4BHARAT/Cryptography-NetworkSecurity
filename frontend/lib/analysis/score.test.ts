// frontend/lib/analysis/score.test.ts
import { describe, it, expect } from "vitest";
import { computeScore } from "./score";

describe("computeScore", () => {
  it("rewards high savings and penalizes overspend", () => {
    const good = computeScore({
      income: 5000,
      spending: 2000,
      budgeted: 1500,
      spentOnBudgeted: 1200,
      prevMonthSpending: 2100,
    });
    const bad = computeScore({
      income: 3000,
      spending: 3400,
      budgeted: 1200,
      spentOnBudgeted: 1400,
      prevMonthSpending: 2000,
    });
    expect(good.score).toBeGreaterThan(bad.score);
    expect(good.savingsRate).toBe(60);
    expect(bad.spendingVsIncome).toBeGreaterThan(100);
  });

  it("returns null rates when income is missing", () => {
    const r = computeScore({
      income: 0,
      spending: 500,
      budgeted: 0,
      spentOnBudgeted: 0,
      prevMonthSpending: null,
    });
    expect(r.savingsRate).toBeNull();
    expect(r.spendingVsIncome).toBeNull();
    expect(r.budgetAdherence).toBeNull();
  });
});