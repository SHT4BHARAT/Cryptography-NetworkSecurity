import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col justify-center px-4">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold leading-tight text-neutral-900 sm:text-4xl">
          Smart Expense Analyzer & Financial Health Dashboard
        </h1>
        <p className="mt-3 text-neutral-600">
          &quot;Because you can&apos;t fix what you can&apos;t see — and most people
          can&apos;t see where their money actually goes.&quot;
        </p>
        <p className="mt-4 text-sm leading-6 text-neutral-500">
          Upload or enter your transactions, get them automatically categorized, and
          receive a clear financial health score with personalized, actionable insights.
          Your data stays private.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-center text-sm font-medium text-neutral-800 hover:bg-neutral-50"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}