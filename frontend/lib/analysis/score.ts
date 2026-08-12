// frontend/lib/analysis/score.ts
export type ScoreResult = {
  score: number;
  savingsRate: number | null;
  spendingVsIncome: number | null;
  budgetAdherence: number | null;
  recommendations: string[];
};

export function computeScore(params: {
  income: number;
  spending: number;
  budgeted: number; // 0 if no budgets
  spentOnBudgeted: number;
  prevMonthSpending: number | null;
}): ScoreResult {
  const recs: string[] = [];
  const savingsRate =
    params.income > 0 ? (params.income - params.spending) / params.income : null;

  let score = 50;
  if (savingsRate !== null) {
    score += Math.max(-25, Math.min(25, savingsRate * 100));
    if (savingsRate < 0)
      recs.push("You spent more than you earned this month — aim to cover essentials only.");
    else if (savingsRate < 0.1)
      recs.push("Your savings rate is under 10%. Consider trimming discretionary spending.");
    else recs.push("Great savings rate. Keep it up.");
  }
  if (params.income > 0) {
    const ratio = params.spending / params.income;
    if (ratio > 1) recs.push("Your spending exceeds your income. Review non-essential categories.");
    else if (ratio > 0.85)
      recs.push("You're spending close to your full income. Look for one category to cut.");
  }
  if (params.budgeted > 0) {
    const adherence = params.spentOnBudgeted / params.budgeted;
    if (adherence > 1) {
      score -= 15;
      recs.push(`You overspent your category budgets by ${Math.round((adherence - 1) * 100)}%.`);
    } else {
      score += Math.min(10, (1 - adherence) * 10);
      recs.push("You stayed within your category budgets this month.");
    }
  }
  if (params.prevMonthSpending !== null && params.spending > params.prevMonthSpending * 1.4) {
    score -= 10;
    recs.push(
      `Spending jumped ${Math.round((params.spending / params.prevMonthSpending - 1) * 100)}% versus last month.`
    );
  }
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    savingsRate: savingsRate === null ? null : Math.round(savingsRate * 100),
    spendingVsIncome:
      params.income > 0 ? Math.round((params.spending / params.income) * 100) : null,
    budgetAdherence:
      params.budgeted > 0 ? Math.round((params.spentOnBudgeted / params.budgeted) * 100) : null,
    recommendations: recs,
  };
}