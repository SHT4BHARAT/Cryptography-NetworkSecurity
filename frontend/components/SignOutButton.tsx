// frontend/components/SignOutButton.tsx
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
    <button
      onClick={onSignOut}
      className="text-sm text-neutral-600 hover:text-neutral-900"
    >
      Sign out
    </button>
  );
}