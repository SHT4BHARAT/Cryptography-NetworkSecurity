// frontend/components/SubscriptionList.tsx
"use client";
type S = { merchant: string; amount: number; cadence: string; lastDetected: string };
export function SubscriptionList({ subscriptions }: { subscriptions: S[] }) {
  if (!subscriptions.length) return null;
  return (
    <section className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">
        Detected subscriptions
      </h2>
      <ul className="divide-y divide-neutral-100">
        {subscriptions.map((s, i) => (
          <li key={i} className="flex justify-between py-2 text-sm">
            <span className="text-neutral-700">{s.merchant}</span>
            <span className="font-medium text-neutral-900">
              ${Number(s.amount).toFixed(2)}/{s.cadence}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}