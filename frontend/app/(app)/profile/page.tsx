// frontend/app/(app)/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { ErrorMessage } from "@/components/ErrorMessage";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setFullName(data.profile?.fullName ?? "");
          setMonthlyIncome(
            data.profile?.monthlyIncome !== null && data.profile?.monthlyIncome !== undefined
              ? String(data.profile.monthlyIncome)
              : ""
          );
        }
      } catch {
        setError("Failed to load profile settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim() || undefined,
          monthlyIncome: monthlyIncome !== "" ? Number(monthlyIncome) : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update profile");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-xl text-ink">Profile &amp; Settings</h1>
        <p className="mt-1 text-sm text-ledger">
          Manage your display name and baseline monthly income for health score calculations.
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {success && (
        <div className="rounded-[3px] border border-credit/30 bg-credit/10 p-4 text-sm text-credit">
          Profile settings saved successfully!
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ledger">Loading profile…</p>
      ) : (
        <form onSubmit={onSubmit} className="panel space-y-4">
          <label className="block text-sm font-medium text-ink">
            Full name
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="field"
            />
          </label>

          <label className="block text-sm font-medium text-ink">
            Baseline monthly income ($)
            <input
              type="number"
              step="0.01"
              min="0"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="e.g. 5000"
              className="field"
            />
            <span className="mt-1 block text-xs text-ledger">
              Used to calculate financial health when no explicit income transactions exist.
            </span>
          </label>

          <button disabled={saving} className="btn btn-primary w-full">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      )}
    </div>
  );
}
