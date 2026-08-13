// frontend/app/(app)/budgets/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { currentMonthKey } from "@/lib/utils/date";

type Budget = { id: string; category: string; month: string; amount: number };
type Goal = { id: string; name: string; target_amount: number; saved_amount: number; deadline: string | null };
type Tx = { date: string; amount: number; category: string };

const currentMonth = () => currentMonthKey();

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[] | null>(null);
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [month, setMonth] = useState(currentMonth());
  const [monthlySpend, setMonthlySpend] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  // budget form
  const [cat, setCat] = useState("");
  const [bMonth, setBMonth] = useState(currentMonth());
  const [bAmount, setBAmount] = useState("");
  // goal form
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");

  const load = useCallback(async (forMonth: string) => {
    setError(null);
    try {
      const [bRes, gRes] = await Promise.all([
        fetch("/api/budgets", { cache: "no-store" }),
        fetch("/api/goals", { cache: "no-store" }),
      ]);
      const [bData, gData] = await Promise.all([
        bRes.ok ? bRes.json() : Promise.resolve({ budgets: [] }),
        gRes.ok ? gRes.json() : Promise.resolve({ goals: [] }),
      ]);
      setBudgets(bData.budgets);
      setGoals(gData.goals);

      const tRes = await fetch("/api/transactions", { cache: "no-store" });
      const tData = tRes.ok ? await tRes.json() : { transactions: [] };
      const byCat: Record<string, number> = {};
      for (const t of (tData.transactions ?? []) as Tx[]) {
        if (t.amount < 0 && t.date.startsWith(forMonth)) {
          byCat[t.category] = (byCat[t.category] ?? 0) + Math.abs(t.amount);
        }
      }
      setMonthlySpend(byCat);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    load(month);
  }, [load, month]);

  const addBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: cat, month: bMonth, amount: Number(bAmount) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error ?? "Could not save budget");
    setCat("");
    setBAmount("");
    await load(month);
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, targetAmount: Number(target), deadline: deadline || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error ?? "Could not save goal");
    setName("");
    setTarget("");
    setDeadline("");
    await load(month);
  };

  const visibleBudgets = (budgets ?? []).filter((b) => b.month.startsWith(month));

  return (
    <div className="space-y-8">
      <h1 className="font-display text-xl text-ink">Budgets &amp; Goals</h1>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="panel">
          <h2 className="mb-4 font-display text-lg text-ink">Budget progress</h2>
          <label className="mb-3 block text-sm font-medium text-ink">
            Month
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="field"
            />
          </label>
          {visibleBudgets.length === 0 ? (
            <EmptyState
              title="No budgets for this month"
              hint="Set a monthly budget per category below."
            />
          ) : (
            <ul className="space-y-4">
              {visibleBudgets.map((b) => {
                const spent = monthlySpend[b.category] ?? 0;
                const pct = b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;
                const over = spent > b.amount;
                return (
                  <li key={b.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-ink">{b.category}</span>
                      <span className={`figures ${over ? "font-medium text-debit" : "text-ledger"}`}>
                        ${spent.toFixed(2)} / ${Number(b.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-[3px] bg-line">
                      <div
                        className={`h-full rounded-[3px] ${over ? "bg-debit" : "bg-brass"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {over && (
                      <p className="figures mt-1 text-xs text-debit">
                        Overspent by ${(spent - Number(b.amount)).toFixed(2)}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2 className="mb-4 font-display text-lg text-ink">Savings goals</h2>
          {!goals || goals.length === 0 ? (
            <EmptyState title="No savings goals" hint="Create a goal to track progress over time." />
          ) : (
            <ul className="space-y-4">
              {goals.map((g) => {
                const pct =
                  g.target_amount > 0
                    ? Math.min(100, Math.round((g.saved_amount / g.target_amount) * 100))
                    : 0;
                return (
                  <li key={g.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-ink">{g.name}</span>
                      <span className="figures text-ledger">
                        ${Number(g.saved_amount).toFixed(2)} / ${Number(g.target_amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-[3px] bg-line">
                      <div className="h-full rounded-[3px] bg-credit" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="panel">
          <h2 className="mb-4 font-display text-lg text-ink">Set a budget</h2>
          <form onSubmit={addBudget} className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm font-medium text-ink">
              Category
              <input
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                required
                placeholder="Food & Dining"
                className="field"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Month
              <input
                type="month"
                value={bMonth}
                onChange={(e) => setBMonth(e.target.value)}
                required
                className="field"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Amount
              <input
                type="number"
                step="0.01"
                min="0"
                value={bAmount}
                onChange={(e) => setBAmount(e.target.value)}
                required
                className="field"
              />
            </label>
            <button className="btn btn-primary sm:col-span-3">Save budget</button>
          </form>
        </section>

        <section className="panel">
          <h2 className="mb-4 font-display text-lg text-ink">Start a goal</h2>
          <form onSubmit={addGoal} className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm font-medium text-ink">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Emergency fund"
                className="field"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Target amount
              <input
                type="number"
                step="0.01"
                min="0"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
                className="field"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Deadline (optional)
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="field"
              />
            </label>
            <button className="btn btn-primary sm:col-span-3">Create goal</button>
          </form>
        </section>
      </div>
    </div>
  );
}
