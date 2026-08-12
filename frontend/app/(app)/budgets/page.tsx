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
      <h1 className="text-xl font-semibold text-neutral-900">Budgets & Goals</h1>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Budget progress</h2>
          <label className="mb-3 block text-sm font-medium text-neutral-700">
            Month
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
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
                      <span className="font-medium text-neutral-700">{b.category}</span>
                      <span className={over ? "font-medium text-red-600" : "text-neutral-500"}>
                        ${spent.toFixed(2)} / ${Number(b.amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-neutral-100">
                      <div
                        className={`h-full rounded ${over ? "bg-red-500" : "bg-blue-600"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {over && (
                      <p className="mt-1 text-xs text-red-600">
                        Overspent by ${(spent - Number(b.amount)).toFixed(2)}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Savings goals</h2>
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
                      <span className="font-medium text-neutral-700">{g.name}</span>
                      <span className="text-neutral-500">
                        ${Number(g.saved_amount).toFixed(2)} / ${Number(g.target_amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded bg-neutral-100">
                      <div className="h-full rounded bg-emerald-600" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Set a budget</h2>
          <form onSubmit={addBudget} className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm font-medium text-neutral-700">
              Category
              <input
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                required
                placeholder="Food & Dining"
                className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Month
              <input
                type="month"
                value={bMonth}
                onChange={(e) => setBMonth(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Amount
              <input
                type="number"
                step="0.01"
                min="0"
                value={bAmount}
                onChange={(e) => setBAmount(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
              />
            </label>
            <button className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white sm:col-span-3">
              Save budget
            </button>
          </form>
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Start a goal</h2>
          <form onSubmit={addGoal} className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm font-medium text-neutral-700">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Emergency fund"
                className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Target amount
              <input
                type="number"
                step="0.01"
                min="0"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
              />
            </label>
            <label className="block text-sm font-medium text-neutral-700">
              Deadline (optional)
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
              />
            </label>
            <button className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white sm:col-span-3">
              Create goal
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}