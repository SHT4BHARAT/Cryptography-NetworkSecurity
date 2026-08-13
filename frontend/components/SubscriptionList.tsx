"use client";
type S = { merchant: string; amount: number; cadence: string; lastDetected: string };
export function SubscriptionList({ subscriptions }: { subscriptions: S[] }) {
  if (!subscriptions.length) return null;
  return (
    <section className="panel">
      <h2 className="mb-4 font-display text-lg text-ink">Detected subscriptions</h2>
      <ul className="divide-y divide-line">
        {subscriptions.map((s, i) => (
          <li key={i} className="flex justify-between py-2.5 text-sm">
            <span className="text-ink">{s.merchant}</span>
            <span className="figures font-medium text-ink">
              ${Number(s.amount).toFixed(2)}/{s.cadence}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
