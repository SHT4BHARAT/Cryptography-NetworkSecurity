// frontend/app/(app)/layout.tsx
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/budgets", label: "Budgets" },
  { href: "/health", label: "Health" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-5 overflow-x-auto px-4 py-3">
          <Link href="/dashboard" className="whitespace-nowrap font-semibold text-neutral-900">
            Expense Analyzer
          </Link>
          <div className="flex items-center gap-5">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="whitespace-nowrap text-sm text-neutral-600 hover:text-neutral-900"
              >
                {n.label}
              </Link>
            ))}
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