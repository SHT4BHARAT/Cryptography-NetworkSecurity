// frontend/app/(auth)/signup/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const redirectUrl = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: redirectUrl,
      },
    });
    setBusy(false);
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="mx-auto mt-16 w-full max-w-sm space-y-6 px-4">
      <div>
        <h1 className="font-display text-2xl text-ink">Create account</h1>
        <p className="mt-1 text-sm text-ledger">Your financial data stays private.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-ink">
          Full name
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="field"
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="field"
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="field"
          />
        </label>
        {error && (
          <p role="alert" className="rounded-[3px] border border-debit/30 bg-debit/10 p-2 text-sm text-debit">
            {error}
          </p>
        )}
        <button disabled={busy} className="btn btn-primary w-full">
          {busy ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="text-sm text-ledger">
        Have an account?{" "}
        <Link href="/login" className="text-brass underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
