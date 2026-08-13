// frontend/app/(app)/layout.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/budgets", label: "Budgets" },
  { href: "/health", label: "Health" },
  { href: "/profile", label: "Profile" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b border-line bg-paper-raised">
        <div className="mx-auto flex max-w-5xl items-center gap-6 overflow-x-auto px-4">
          <Link href="/dashboard" className="whitespace-nowrap py-4 font-display italic text-lg text-ink">
            Expense Analyzer
          </Link>
          <div className="flex items-center gap-5">
            {NAV.map((n) => {
              const active = pathname?.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`whitespace-nowrap border-b-2 py-4 text-xs uppercase tracking-wide ${
                    active
                      ? "border-brass text-ink"
                      : "border-transparent text-ledger hover:text-ink"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>
          <div className="ml-auto">
            <SignOutButton />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
