"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  const onSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button onClick={onSignOut} className="text-xs uppercase tracking-wide text-ledger hover:text-ink">
      Sign out
    </button>
  );
}
