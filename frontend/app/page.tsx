import Link from "next/link";
import { PulseLine } from "@/components/PulseLine";

const STRIP = [
  {
    label: "Auto-categorized",
    body: "Every transaction sorted into a category the moment it lands.",
  },
  {
    label: "Score, 0–100",
    body: "One number for savings rate, spend vs income, and budget adherence.",
  },
  {
    label: "Private by default",
    body: "Your data lives in your account. Nobody else sees it.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[85vh] w-full max-w-4xl flex-col justify-center px-4 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-ledger">Expense Analyzer</p>

      <h1 className="mt-3 font-display text-4xl italic leading-tight text-ink sm:text-5xl">
        See where your money actually goes.
      </h1>

      <p className="mt-5 max-w-xl border-l-2 border-brass pl-4 text-ink/80">
        &ldquo;Because you can&apos;t fix what you can&apos;t see — and most people
        can&apos;t see where their money actually goes.&rdquo;
      </p>

      <p className="mt-4 max-w-xl text-sm leading-6 text-ledger">
        Add transactions or import a bank CSV. We categorize them, score your
        financial health from 0–100, and tell you exactly what to change next.
      </p>

      <div className="mt-8 flex items-center gap-6 panel px-6 py-4">
        <div className="h-12 w-40 shrink-0">
          <PulseLine tone="credit" jitter={0.08} />
        </div>
        <div>
          <p className="figures text-3xl text-credit">78</p>
          <p className="text-xs uppercase tracking-wide text-ledger">Healthy — sample score</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/signup" className="btn btn-primary">
          Create account
        </Link>
        <Link href="/login" className="btn btn-ghost">
          Log in
        </Link>
      </div>

      <dl className="mt-14 grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
        {STRIP.map((s) => (
          <div key={s.label}>
            <dt className="text-xs uppercase tracking-wide text-brass">{s.label}</dt>
            <dd className="mt-1.5 text-sm text-ledger">{s.body}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
