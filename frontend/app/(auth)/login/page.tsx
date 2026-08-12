// frontend/app/(auth)/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="mx-auto mt-16 w-full max-w-sm space-y-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Log in</h1>
        <p className="mt-1 text-sm text-neutral-500">Welcome back to your financial dashboard.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-neutral-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
          />
        </label>
        <label className="block text-sm font-medium text-neutral-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-neutral-300 p-2"
          />
        </label>
        {error && (
          <p role="alert" className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="text-sm text-neutral-600">
        No account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}