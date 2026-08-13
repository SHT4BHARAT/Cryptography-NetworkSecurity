// frontend/app/(app)/transactions/page.tsx
"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { currentDateKey } from "@/lib/utils/date";

type Tx = {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
};

const today = () => currentDateKey();

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Tx[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(today());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const onDelete = async (id: string) => {
    setFormError(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not delete transaction");
      }
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl text-ink">Transactions</h1>
        <Link href="/transactions/import" className="btn btn-primary">
          Import CSV
        </Link>
      </div>

      <form onSubmit={onSubmit} className="panel grid gap-3 sm:grid-cols-4">
        <label className="block text-sm font-medium text-ink">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="field"
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          Amount
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="e.g. -12.99 or 3000"
            className="field"
          />
        </label>
        <label className="block text-sm font-medium text-ink sm:col-span-2">
          Description
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="e.g. NETFLIX.COM"
            className="field"
          />
        </label>
        {formError && (
          <div className="sm:col-span-4">
            <ErrorMessage message={formError} />
          </div>
        )}
        <button disabled={saving} className="btn btn-primary sm:col-span-4">
          {saving ? "Saving…" : "Add transaction"}
        </button>
      </form>

      {error && <ErrorMessage message={error} />}

      {!transactions ? (
        <p className="text-sm text-ledger">Loading…</p>
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          hint="Add one above, or import a CSV statement."
        />
      ) : (
        <div className="panel overflow-hidden p-0">
          <ul className="divide-y divide-line">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="figures w-24 shrink-0 text-ledger">{t.date}</span>
                <span className="flex-1 truncate text-ink">{t.description}</span>
                <span className="hidden rounded-[3px] bg-line px-2 py-0.5 text-xs text-ledger sm:inline">
                  {t.category}
                </span>
                <span
                  className={`figures w-20 text-right font-medium ${
                    t.amount < 0 ? "text-debit" : "text-credit"
                  }`}
                >
                  {t.amount < 0 ? "-" : "+"}
                  ${Math.abs(t.amount).toFixed(2)}
                </span>
                <button
                  onClick={() => onDelete(t.id)}
                  disabled={deletingId === t.id}
                  aria-label={`Delete ${t.description}`}
                  className="shrink-0 rounded-[3px] px-2 py-1 text-xs text-debit hover:bg-debit/10 disabled:opacity-50"
                >
                  {deletingId === t.id ? "Deleting…" : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}