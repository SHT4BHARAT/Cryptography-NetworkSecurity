// frontend/app/(app)/transactions/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";

type Tx = {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
};

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Tx[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(today());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/transactions", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load transactions");
      const data = await res.json();
      setTransactions(data.transactions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    load();
  }, [load]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, amount: Number(amount), description }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not save transaction");
      }
      setAmount("");
      setDescription("");
      setDate(today());
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Transactions</h1>
        <Link
          href="/transactions/import"
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Import CSV
        </Link>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border bg-white p-6 sm:grid-cols-4">
        <label className="block text-sm font-medium text-neutral-700">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-700">
          Amount
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="e.g. -12.99 or 3000"
            className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-700 sm:col-span-2">
          Description
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="e.g. NETFLIX.COM"
            className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
          />
        </label>
        {formError && (
          <div className="sm:col-span-4">
            <ErrorMessage message={formError} />
          </div>
        )}
        <button
          disabled={saving}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 sm:col-span-4"
        >
          {saving ? "Saving…" : "Add transaction"}
        </button>
      </form>

      {error && <ErrorMessage message={error} />}

      {!transactions ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          hint="Add one above, or import a CSV statement."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-white">
          <ul className="divide-y divide-neutral-100">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="w-24 shrink-0 text-neutral-500">{t.date}</span>
                <span className="flex-1 truncate text-neutral-800">{t.description}</span>
                <span className="hidden rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 sm:inline">
                  {t.category}
                </span>
                <span
                  className={`w-20 text-right font-medium ${
                    t.amount < 0 ? "text-neutral-900" : "text-green-600"
                  }`}
                >
                  {t.amount < 0 ? "-" : "+"}
                  ${Math.abs(t.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}