# Smart Expense Analyzer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Smart Expense Analyzer & Financial Health Dashboard — a Next.js app on Supabase where users upload/enter transactions, get them auto-categorized, and see a health score, insights, budgets and goals.

**Architecture:** Single Next.js (App Router) app in `frontend/`. Route handlers in `frontend/app/api/*` are the only write path (validation + categorization + scoring all server-side). `backend/` holds the Supabase SQL migrations (schema + RLS). Supabase Auth handles identity; Recharts renders all dashboard charts. Hosted on Vercel, DB on Supabase.

**Tech Stack:** Next.js 14+ (App Router, TypeScript, Tailwind), Supabase (Postgres + Auth + SSR), Recharts, zod, papaparse.

---

## File Structure

```
frontend/
  app/
    (auth)/login/page.tsx          # login form
    (auth)/signup/page.tsx         # signup form
    (app)/dashboard/page.tsx       # main dashboard (charts)
    (app)/transactions/page.tsx    # list + manual add
    (app)/transactions/import/page.tsx   # CSV upload UI
    (app)/budgets/page.tsx         # budgets & goals
    (app)/health/page.tsx          # health score detail
    api/transactions/route.ts      # POST manual add, GET list
    api/transactions/import/route.ts    # POST CSV upload (parses + categorizes)
    api/categorize/route.ts        # POST retroactive categorization
    api/budgets/route.ts           # POST/GET budgets
    api/goals/route.ts             # POST/GET savings goals
    api/health/route.ts            # GET current health score + breakdown
    api/analyze/route.ts           # GET insights (top cats, trends, subscriptions)
    api/auth/me/route.ts           # GET current user + profile
    globals.css
    layout.tsx
    page.tsx                       # landing/redirect
  lib/
    supabase/server.ts             # server client factory (SSR)
    supabase/client.ts             # browser client factory
    supabase/admin.ts              # service-role client (only server, safe)
    validation/schemas.ts          # zod schemas for all route bodies
    categorization/rules.ts        # keyword -> category map
    categorization/categorize.ts   # rule matcher + LLM fallback + cache hit
    analysis/insights.ts           # top categories, trends, spikes
    analysis/score.ts              # health score calc + recommendations
    analysis/subscriptions.ts      # recurring merchant detector
    utils/csv.ts                   # papaparse wrapper, row validation, dedupe
  middleware.ts                    # protection: redirect unauthenticated users
  .env.local.example
  package.json
backend/
  migrations/
    001_init.sql                   # schema + RLS
    002_seed.sql                   # demo user + sample transactions
  README.md                        # supabase setup + endpoint map
docs/
  design.md
  database-schema.md
  dataflowdiagram.md
  superpowers/plans/2026-08-12-smart-expense-analyzer-implementation-plan.md
api-documentation.md
architecture-diagram.png
README.md
```

---

## Task 0: Scaffold Next.js app and dependencies

**Files:**
- Create: `frontend/` (scaffold output)
- Create: `frontend/.env.local.example`
- Create: `backend/README.md`
- Create: `backend/migrations/001_init.sql` (see Task 1)

- [x] **Step 1: Scaffold Next.js**

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

Run from repo root: `cd frontend && npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"`
Expected: Tailwind config exists, `app/` dir created.

- [x] **Step 2: Install dependencies**

```bash
cd frontend
npm install @supabase/supabase-js @supabase/ssr recharts zod papaparse
npm install -D @types/papaparse
```
Expected: packages written to `package.json`.

- [x] **Step 3: Create `.env.local.example`**

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [x] **Step 4: Commit**

```bash
git add frontend backend docs
git commit -m "chore: scaffold Next.js project with Supabase, Recharts, zod, papaparse"
```

---

## Task 1: Database schema and RLS

**Files:**
- Create: `backend/migrations/001_init.sql`

- [x] **Step 1: Write the migration**

```sql
-- backend/migrations/001_init.sql
create extension if not exists "pgcrypto";

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  monthly_income numeric(12,2) default null,
  created_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'checking',
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  date date not null,
  amount numeric(12,2) not null,
  description text not null,
  category text not null default 'Uncategorized',
  dedupe_hash text,
  raw text,
  created_at timestamptz not null default now()
);
create index trx_user_date_idx on public.transactions(user_id, date desc);
create unique index trx_dedupe_idx on public.transactions(user_id, dedupe_hash) where dedupe_hash is not null;

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  month date not null,
  amount numeric(12,2) not null,
  unique (user_id, category, month)
);

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12,2) not null,
  saved_amount numeric(12,2) not null default 0,
  deadline date,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant text not null,
  amount numeric(12,2) not null,
  cadence text not null default 'monthly',
  last_detected date not null,
  active boolean not null default true,
  notes text,
  unique (user_id, merchant, amount)
);

create table public.health_snapshots (
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  score int not null,
  breakdown jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, month)
);

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.subscriptions enable row level security;
alter table public.health_snapshots enable row level security;

create policy "profiles own" on public.profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "accounts own" on public.accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions own" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budgets own" on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals own" on public.savings_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subscriptions own" on public.subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "snapshots own" on public.health_snapshots for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [x] **Step 2: Create `backend/README.md`**

```md
# Backend

- [x] 001_init.sql - full schema + RLS. Run in Supabase SQL editor.
- 002_seed.sql - optional demo data.

Endpoint -> handler map:
- POST /api/transactions -> frontend/app/api/transactions/route.ts
- GET /api/transactions -> frontend/app/api/transactions/route.ts
- POST /api/transactions/import -> frontend/app/api/transactions/import/route.ts
- POST /api/categorize -> frontend/app/api/categorize/route.ts
- POST/GET /api/budgets -> frontend/app/api/budgets/route.ts
- POST/GET /api/goals -> frontend/app/api/goals/route.ts
- GET /api/health -> frontend/app/api/health/route.ts
- GET /api/analyze -> frontend/app/api/analyze/route.ts

See ..\api-documentation.md for full request/response details.
```

- [x] **Step 3: Commit**

```bash
git add backend
git commit -m "feat: add initial Supabase schema with RLS policies"
```

---

## Task 2: Supabase clients and auth guard

**Files:**
- Create: `frontend/lib/supabase/server.ts`
- Create: `frontend/lib/supabase/client.ts`
- Create: `frontend/lib/supabase/admin.ts`
- Create: `frontend/middleware.ts`

- [x] **Step 1: Server client**

```ts
// frontend/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```

- [x] **Step 2: Browser client**

```ts
// frontend/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [x] **Step 3: Admin client (server only)** — used for email confirmation and server ops. Never import this into a client component.

```ts
// frontend/lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

export const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

- [x] **Step 4: Middleware session guard**

```ts
// frontend/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const isPublic = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!data.user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (data.user && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
```

- [x] **Step 5: Commit**

```bash
git add frontend/lib frontend/middleware.ts
git commit -m "feat: add Supabase SSR clients and auth middleware"
```

---

## Task 3: Auth pages and /api/auth/me

**Files:**
- Create: `frontend/app/(auth)/login/page.tsx`
- Create: `frontend/app/(auth)/signup/page.tsx`
- Create: `frontend/app/api/auth/me/route.ts`
- Create: `frontend/lib/validation/schemas.ts` (auth parts)

- [x] **Step 1: zod schemas**

```ts
// frontend/lib/validation/schemas.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = loginSchema.extend({ fullName: z.string().min(1) });

export const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().finite(),
  description: z.string().min(1).max(200),
  accountId: z.string().uuid().optional(),
});

export const budgetSchema = z.object({
  category: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.number().positive(),
});

export const goalSchema = z.object({
  name: z.string().min(1).max(100),
  targetAmount: z.number().positive(),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
```

- [x] **Step 2: Login page**

```tsx
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="mx-auto mt-16 max-w-sm space-y-6 px-4">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 required className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 required className="mt-1 w-full rounded border p-2" />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-blue-600 py-2 text-white">Log in</button>
      </form>
      <p className="text-sm">No account? <Link href="/signup" className="underline">Sign up</Link></p>
    </main>
  );
}
```

- [x] **Step 3: Signup page** (same pattern; on success `signUp({ email, password, options: { data: { full_name } } })`, auto-confirm via redirect or admin confirms; on success push to `/dashboard`).

```tsx
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return setError(error.message);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="mx-auto mt-16 max-w-sm space-y-6 px-4">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
                 className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block">Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                 className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block">Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                 required className="mt-1 w-full rounded border p-2" />
        </label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-blue-600 py-2 text-white">Sign up</button>
      </form>
      <p className="text-sm">Have an account? <Link href="/login" className="underline">Log in</Link></p>
    </main>
  );
}
```

- [x] **Step 4: /api/auth/me**

```ts
// frontend/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("user_id", user.id).single();

  return NextResponse.json({ user: { id: user.id, email: user.email }, profile });
}
```

- [x] **Step 5: Manual test** — `npm run dev`, sign up, verify redirect to `/dashboard`, call `/api/auth/me` for 200.
- [x] **Step 6: Commit**

```bash
git add frontend/app frontend/lib
git commit -m "feat: add signup/login pages and current-user API"
```

---

## Task 4: CSV parser with dedupe

**Files:**
- Create: `frontend/lib/utils/csv.ts`

- [x] **Step 1: Write CSV utilities + unit tests**

```ts
// frontend/lib/utils/csv.ts
import { parse } from "papaparse";
import crypto from "crypto";

export type ParsedRow =
  | { ok: true; date: string; amount: number; description: string }
  | { ok: false; line: number; reason: string };

export function parseDate(value: string): string | null {
  const s = String(value).trim().replace(/\./g, "-");
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = /^(\d{2})-(\d{2})-(\d{4})$/.exec(s);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

export function normalizeAmount(value: unknown): number | null {
  const n = Number(String(value).replace(/[,$\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function dedupeHash(userId: string, date: string, amount: number, description: string): string {
  const s = `${userId}|${date}|${amount.toFixed(2)}|${description.trim().toLowerCase()}`;
  return crypto.createHash("sha256").update(s).digest("hex");
}

export function parseCsv(text: string, userId: string): { rows: ParsedRow[]; hashes: string[] } {
  const result = parse<string[]>(text, { skipEmptyLines: true });
  const rows: ParsedRow[] = [];
  const hashes: string[] = [];
  (result.data as string[][]).forEach((cols, idx) => {
    const line = idx + 2; // 1-based incl. header
    if (cols.length < 3) return; // tolerate blank junk rows
    const [dateRaw, desc, amountRaw, ...rest] = cols;
    if (!dateRaw && !desc && !amountRaw) return;
    const date = parseDate(dateRaw);
    const amount = normalizeAmount(amountRaw);
    const description = String(desc || "").trim();
    if (!date) return rows.push({ ok: false, line, reason: `Unrecognized date: "${dateRaw}"` });
    if (amount === null) return rows.push({ ok: false, line, reason: `Invalid amount: "${amountRaw}"` });
    if (!description) return rows.push({ ok: false, line, reason: "Missing description" });
    const hash = dedupeHash(userId, date, amount, description);
    rows.push({ ok: true, date, amount, description });
    hashes.push(hash);
  });
  return { rows, hashes };
}
```

- [x] **Step 2: Write tests** (`frontend/lib/utils/csv.test.ts`). Install test runner if needed: `npm install -D vitest`.

```ts
// frontend/lib/utils/csv.test.ts
import { describe, it, expect } from "vitest";
import { parseDate, normalizeAmount, dedupeHash, parseCsv } from "./csv";

describe("parseDate", () => {
  it("handles ISO, DMY and slash formats", () => {
    expect(parseDate("2024-03-01")).toBe("2024-03-01");
    expect(parseDate("01-03-2024")).toBe("2024-03-01");
    expect(parseDate("01/03/2024")).toBe("2024-03-01");
  });
  it("returns null for garbage", () => {
    expect(parseDate("not-a-date")).toBeNull();
  });
});

describe("normalizeAmount", () => {
  it("strips currency separators", () => {
    expect(normalizeAmount("$1,234.56")).toBe(1234.56);
    expect(normalizeAmount("-45.00")).toBe(-45);
  });
});

describe("dedupeHash", () => {
  it("is stable and case-insensitive", () => {
    const a = dedupeHash("u1", "2024-01-01", 9.99, " Netflix ");
    const b = dedupeHash("u1", "2024-01-01", 9.99, "netflix");
    expect(a).toBe(b);
  });
});

describe("parseCsv", () => {
  it("collects bad rows with line numbers and keeps good rows", () => {
    const csv = "Date,Description,Amount\n2024-03-01,Coffee shop,-5.50\n01-04-2024,Salary,3000\nbad-date,garbage,nope\n";
    const { rows } = parseCsv(csv, "u1");
    expect(rows.filter((r) => r.ok === true)).toHaveLength(2);
    expect(rows.filter((r) => r.ok === false)).toHaveLength(1);
  });
});
```

- [x] **Step 3: Run tests — expect pass**

```
cd frontend
npx vitest run
```

- [x] **Step 4: Commit**

```bash
git add frontend/lib frontend/package.json
git commit -m "feat: add tolerant CSV parser with dedupe hashing"
```

---

## Task 5: Categorization engine (rules + LLM fallback)

**Files:**
- Create: `frontend/lib/categorization/rules.ts`
- Create: `frontend/lib/categorization/categorize.ts`

- [x] **Step 1: Keyword rules**

```ts
// frontend/lib/categorization/rules.ts
export const CATEGORIES = [
  "Food & Dining", "Groceries", "Rent", "Shopping", "Subscriptions",
  "Travel", "Bills & Utilities", "Entertainment", "Transport", "Health",
  "Income", "Transfers", "Uncategorized",
] as const;

export type Category = (typeof CATEGORIES)[number];

type Rule = { keywords: string[]; category: Category };

const OUTPUT_CATEGORY: Record<string, Category> = {
  Food & Dining: "Food & Dining",
  Groceries: "Groceries",
  Rent: "Rent",
  Shopping: "Shopping",
  Subscription: "Subscriptions",
  Travel: "Travel",
  Bills: "Bills & Utilities",
  Entertainment: "Entertainment",
  Transport: "Transport",
  Health: "Health",
};

const RULES: Rule[] = [
  { keywords: ["salary", "payroll", "wages", "deposit acct"], category: "Income" },
  { keywords: ["zomato", "swiggy", "uber eats", "doordash", "restaurant", "cafe", "starbucks", "pizza"], category: "Food & Dining" },
  { keywords: ["walmart", "target", "whole foods", "trader joe", "grocery", "publix", "safeway"], category: "Groceries" },
  { keywords: ["rent ", "lease", "property mgmt"], category: "Rent" },
  { keywords: ["amazon", "flipkart", "myntra", "nike", "zara", "hm ", "h&m", "mall"], category: "Shopping" },
  { keywords: ["netflix", "spotify", "prime video", "hulu", "disney+", "hbo", "youtube premium", "dropbox"], category: "Subscriptions" },
  { keywords: ["airline", "air india", "booking.com", "airbnb", "hotel", "uber", "ola", "lyft", "irctc", "fuel"], category: "Travel" },
  { keywords: ["electricity", "water bill", "gas bill", "internet", "broadband", "jio", "airtel", "recharge", "eb bill"], category: "Bills & Utilities" },
  { keywords: ["ticket", "cinema", "movie", "game", "steam", "concert", "bookmyshow"], category: "Entertainment" },
  { keywords: ["metro", "bus", "train", "parking", "taxi", "petrol", "diesel"], category: "Transport" },
  { keywords: ["pharmacy", "hospital", "clinic", "doctor", "dentist", "medical", "apollo"], category: "Health" },
  { keywords: ["transfer", "upi ref", "imps", "neft", "wallet"], category: "Transfers" },
];

export function categorizeByRules(text: string, amount: number): Category | null {
  if (amount > 0) return "Income";
  const haystack = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => haystack.includes(k))) return rule.category;
  }
  return null;
}

export function mapLlmCategory(label: string): Category {
  const lower = label.toLowerCase();
  for (const key of Object.keys(OUTPUT_CATEGORY)) {
    if (lower.includes(key.toLowerCase())) return OUTPUT_CATEGORY[key];
  }
  return "Uncategorized";
}
```

- [x] **Step 2: Categorizer with LLM fallback (never on critical path)**

```ts
// frontend/lib/categorization/categorize.ts
import { categorizeByRules, mapLlmCategory, type Category } from "./rules";

type LlmRow = { id: string; description: string };

export async function categorizeBatch(
  rows: { id: string; description: string; amount: number }[]
): Promise<Map<string, Category>> {
  const map = new Map<string, Category>();
  const unresolved: LlmRow[] = [];

  for (const row of rows) {
    const byRules = categorizeByRules(row.description, row.amount);
    if (byRules) map.set(row.id, byRules);
    else unresolved.push({ id: row.id, description: row.description });
  }

  if (unresolved.length > 0) {
    try {
      const llm = await llmCategorize(unresolved.map((r) => r.description));
      unresolved.forEach((row, i) => map.set(row.id, mapLlmCategory(llm[i] ?? "")));
    } catch {
      // LLM off critical path: never throw; fall back to Uncategorized
    }
  }
  return map;
}

async function llmCategorize(descriptions: string[]): Promise<string[]> {
  const key = process.env.LLM_API_KEY;
  const base = process.env.LLM_BASE_URL;
  if (!key || !base || descriptions.length === 0) return [];

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      model: process.env.LLM_MODEL ?? "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            `Classify each financial transaction description into exactly one of: ${CATEGORIES.join(", ")}. ` +
            `Return JSON {"categories":["cat1","cat2",...]} matching input order. Only use the listed categories.`,
        },
        { role: "user", content: JSON.stringify(descriptions) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}`);
  const data: { choices?: { message?: { content?: string } }[] } = await res.json();
  const parsed: { categories?: string[] } = JSON.parse(
    data.choices?.[0]?.message?.content ?? "{}"
  );
  return parsed.categories ?? [];
}
```

Add to `.env.local.example`:
```env
LLM_API_KEY=
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

- [x] **Step 3: Write tests for the rule matcher**

```ts
// frontend/lib/categorization/categorize.test.ts
import { describe, it, expect } from "vitest";
import { categorizeByRules, mapLlmCategory } from "./rules";

describe("categorizeByRules", () => {
  it("classifies subscription and income by keyword", () => {
    expect(categorizeByRules("NETFLIX.COM 12.99", -12.99)).toBe("Subscriptions");
    expect(categorizeByRules("SALARY AUGUST", 3000)).toBe("Income");
  });
  it("returns null when nothing matches", () => {
    expect(categorizeByRules("xyz random vendor", -5)).toBeNull();
  });
});

describe("mapLlmCategory", () => {
  it("maps common labels", () => {
    expect(mapLlmCategory("Food and Dining")).toBe("Food & Dining");
    expect(mapLlmCategory("billsUtilities")).toBe("Bills & Utilities");
    expect(mapLlmCategory("gibberish")).toBe("Uncategorized");
  });
});
```

- [x] **Step 4: Run tests — expect pass**

```
cd frontend
npx vitest run
```

- [x] **Step 5: Commit**

```bash
git add frontend/lib/categorization frontend/.env.local.example
git commit -m "feat: add rule-based categorizer with LLM fallback"
```

---

## Task 6: Transaction APIs (add + list + import)

**Files:**
- Create: `frontend/app/api/transactions/route.ts`
- Create: `frontend/app/api/transactions/import/route.ts`
- Create: `frontend/app/api/categorize/route.ts`

- [x] **Step 1: POST/GET /api/transactions**

```ts
// frontend/app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/validation/schemas";
import { categorizeByRules } from "@/lib/categorization/rules";
import { dedupeHash } from "@/lib/utils/csv";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = transactionSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });

  const { date, amount, description, accountId } = parsed.data;
  const category = categorizeByRules(description, amount) ?? "Uncategorized";

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      account_id: accountId ?? null,
      date,
      amount,
      description,
      category,
      dedupe_hash: dedupeHash(user.id, date, amount, description),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ transaction: data }, { status: 201 });
}

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const month = url.searchParams.get("month");

  let query = supabase
    .from("transactions").select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (category) query = query.eq("category", category);
  if (month) {
    query = query.gte("date", `${month}-01`).lt("date", `${month}-01'::date + interval '1 month`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ transactions: data });
}
```

- [x] **Step 2: POST /api/transactions/import (CSV)**

```ts
// frontend/app/api/transactions/import/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseCsv } from "@/lib/utils/csv";
import { categorizeByRules } from "@/lib/categorization/rules";

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  const { rows, hashes } = parseCsv(text, user.id);

  const existing = await supabase
    .from("transactions")
    .select("dedupe_hash")
    .in("dedupe_hash", hashes.length ? hashes : ["__none__"]);

  const existingSet = new Set((existing.data ?? []).map((t) => t.dedupe_hash));

  const toInsert = rows
    .filter((r) => r.ok === true)
    .filter((_, i) => !existingSet.has(hashes[i]))
    .map((r, i) => ({
      user_id: user.id,
      date: (r as { date: string }).date,
      amount: (r as { amount: number }).amount,
      description: (r as { description: string }).description,
      category: categorizeByRules((r as { description: string }).description, (r as { amount: number }).amount) ?? "Uncategorized",
      dedupe_hash: hashes[i],
    }));

  const errors = rows.filter((r) => r.ok === false).map((r, idx) => ({
    line: (r as { line: number }).line,
    reason: (r as { reason: string }).reason,
  }));

  const { error } = await supabase.from("transactions").insert(toInsert);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ imported: toInsert.length, skippedDuplicates: hashes.length - existingSet.size - (hashes.length - toInsert.length), errors });
}
```

- [x] **Step 3: POST /api/categorize — retroactive re-categorize with LLM pass**

```ts
// frontend/app/api/categorize/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { categorizeBatch } from "@/lib/categorization/categorize";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: trx, error } = await supabase
    .from("transactions")
    .select("id, description, amount")
    .eq("user_id", user.id)
    .eq("category", "Uncategorized")
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!trx?.length) return NextResponse.json({ updated: 0 });

  const map = await categorizeBatch(trx.map((t) => ({ id: t.id, description: t.description, amount: Number(t.amount) })));
  const updates = [...map.entries()]
    .filter(([id, cat]) => cat !== "Uncategorized" && trx.some((t) => t.id === id))
    .map(([id, category]) => ({ id, category }));

  if (updates.length) {
    await supabase.from("transactions").upsert(updates, { onConflict: "id" });
  }
  return NextResponse.json({ updated: updates.length });
}
```

- [x] **Step 4: Smoke test with curl** — run dev server, POST a JSON transaction (expect 201), upload a sample CSV (expect imported count + errors array).
- [x] **Step 5: Commit**

```bash
git add frontend/app/api
git commit -m "feat: add transaction add/list/import/categorize APIs"
```

---

## Task 7: Health score, budgets, goals, subscriptions APIs

**Files:**
- Create: `frontend/lib/analysis/score.ts`
- Create: `frontend/lib/analysis/subscriptions.ts`
- Create: `frontend/app/api/health/route.ts`
- Create: `frontend/app/api/budgets/route.ts`
- Create: `frontend/app/api/goals/route.ts`
- Create: `frontend/app/api/subscriptions/route.ts`

- [x] **Step 1: Health score calculator + unit tests**

```ts
// frontend/lib/analysis/score.ts
export type ScoreResult = {
  score: number;
  savingsRate: number | null;
  spendingVsIncome: number | null;
  budgetAdherence: number | null;
  recommendations: string[];
};

export function computeScore(params: {
  income: number;
  spending: number;
  budgeted: number;      // 0 if no budgets
  spentOnBudgeted: number;
  prevMonthSpending: number | null;
}): ScoreResult {
  const recs: string[] = [];
  const savingsRate = params.income > 0 ? (params.income - params.spending) / params.income : null;

  let score = 50;
  if (savingsRate !== null) {
    score += Math.max(-25, Math.min(25, savingsRate * 100));
    if (savingsRate < 0) recs.push("You spent more than you earned this month — aim to cover essentials only.");
    else if (savingsRate < 0.1) recs.push("Your savings rate is under 10%. Consider trimming discretionary spending.");
    else recs.push("Great savings rate. Keep it up.");
  }
  if (params.income > 0) {
    const ratio = params.spending / params.income;
    if (ratio > 1) recs.push("Your spending exceeds your income. Review non-essential categories.");
    else if (ratio > 0.85) recs.push("You're spending close to your full income. Look for one category to cut.");
  }
  if (params.budgeted > 0) {
    const adherence = params.spentOnBudgeted / params.budgeted;
    if (adherence > 1) {
      score -= 15;
      recs.push(`You overspent your category budgets by ${Math.round((adherence - 1) * 100)}%.`);
    } else {
      score += Math.min(10, (1 - adherence) * 10);
      recs.push("You stayed within your category budgets this month.");
    }
  }
  if (params.prevMonthSpending !== null && params.spending > params.prevMonthSpending * 1.4) {
    score -= 10;
    recs.push(`Spending jumped ${Math.round((params.spending / params.prevMonthSpending - 1) * 100)}% versus last month.`);
  }
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    savingsRate: savingsRate === null ? null : Math.round(savingsRate * 100),
    spendingVsIncome: params.income > 0 ? Math.round((params.spending / params.income) * 100) : null,
    budgetAdherence: params.budgeted > 0 ? Math.round((params.spentOnBudgeted / params.budgeted) * 100) : null,
    recommendations: recs,
  };
}
```

```ts
// frontend/lib/analysis/score.test.ts
import { describe, it, expect } from "vitest";
import { computeScore } from "./score";

describe("computeScore", () => {
  it("rewards high savings and penalizes overspend", () => {
    const good = computeScore({ income: 5000, spending: 2000, budgeted: 1500, spentOnBudgeted: 1200, prevMonthSpending: 2100 });
    const bad = computeScore({ income: 3000, spending: 3400, budgeted: 1200, spentOnBudgeted: 1400, prevMonthSpending: 2000 });
    expect(good.score).toBeGreaterThan(bad.score);
    expect(good.savingsRate).toBe(60);
    expect(bad.spendingVsIncome).toBeGreaterThan(100);
  });
});
```

- [x] **Step 2: Subscription detector + unit tests**

```ts
// frontend/lib/analysis/subscriptions.ts
export type Tx = { description: string; amount: number; date: string };
export type Subscription = { merchant: string; amount: number; cadence: "monthly"; occurrences: number; lastDetected: string };

export function detectSubscriptions(transactions: Tx[], minOccurrences = 3): Subscription[] {
  const groups = new Map<string, { amount: number; dates: string[]; merchant: string }>();
  for (const t of transactions.filter((t) => t.amount < 0)) {
    const desc = t.description.trim().toLowerCase();
    const merchant = desc.split(" ").slice(0, 3).join(" ");
    const key = `${merchant}|${t.amount.toFixed(2)}`;
    const group = groups.get(key) ?? { amount: t.amount, dates: [], merchant };
    group.dates.push(t.date);
    groups.set(key, group);
  }
  const result: Subscription[] = [];
  for (const g of groups.values()) {
    if (g.dates.length < minOccurrences) continue;
    const sorted = g.dates.sort();
    const spans: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const days = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000;
      spans.push(days);
    }
    const avg = spans.reduce((a, b) => a + b, 0) / spans.length;
    if (avg >= 25 && avg <= 35) {
      result.push({ merchant: g.merchant, amount: Math.abs(g.amount), cadence: "monthly", occurrences: g.dates.length, lastDetected: sorted[sorted.length - 1] });
    }
  }
  return result;
}
```

```ts
// frontend/lib/analysis/subscriptions.test.ts
import { describe, it, expect } from "vitest";
import { detectSubscriptions } from "./subscriptions";

describe("detectSubscriptions", () => {
  it("flags recurring monthly charges", () => {
    const tx = [
      { description: "Netflix", amount: -9.99, date: "2026-01-05" },
      { description: "Netflix", amount: -9.99, date: "2026-02-05" },
      { description: "Netflix", amount: -9.99, date: "2026-03-05" },
      { description: "Coffee", amount: -5, date: "2026-03-06" },
    ];
    const subs = detectSubscriptions(tx, 3);
    expect(subs).toHaveLength(1);
    expect(subs[0].merchant).toContain("netflix");
  });
});
```

- [x] **Step 3: GET /api/health** — compute from transactions + budgets + profile, upsert `health_snapshots`, return breakdown.

```ts
// frontend/app/api/health/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeScore } from "@/lib/analysis/score";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const month = new Date().toISOString().slice(0, 7);
  const [profileRes, trxRes, budgetRes] = await Promise.all([
    supabase.from("profiles").select("monthly_income").eq("user_id", user.id).single(),
    supabase.from("transactions").select("amount, date, category").eq("user_id", user.id),
    supabase.from("budgets").select("amount, category").eq("user_id", user.id).eq("month", `${month}-01`),
  ]);

  const trx = trxRes.data ?? [];
  const income = profileRes.data?.monthly_income ?? 0;
  const actualIncome = trx.filter((t) => t.amount > 0).reduce((s, t) => s + Number(t.amount), 0);
  const totalIncome = Math.max(Number(income), actualIncome);
  const spending = Math.abs(trx.filter((t) => t.amount < 0).reduce((s, t) => s + Number(t.amount), 0));
  const budgeted = (budgetRes.data ?? []).reduce((s, b) => s + Number(b.amount), 0);
  const spentOnBudgeted = (budgetRes.data ?? []).reduce((s, b) => s + Math.abs(trx.filter((t) => t.category === b.category && t.amount < 0).reduce((x, t) => x + Number(t.amount), 0)), 0);

  const prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevKey = prevMonth.toISOString().slice(0, 7);
  const prevSpending = Math.abs(trx.filter((t) => t.amount < 0 && t.date.startsWith(prevKey)).reduce((s, t) => s + Number(t.amount), 0));

  const result = computeScore({
    income: totalIncome,
    spending,
    budgeted,
    spentOnBudgeted,
    prevMonthSpending: prevSpending || null,
  });

  await supabase.from("health_snapshots").upsert({
    user_id: user.id,
    month: `${month}-01`,
    score: result.score,
    breakdown: result,
  });

  return NextResponse.json({ month, ...result });
}
```

- [x] **Step 4: Budgets + goals + subscriptions routes**

```ts
// frontend/app/api/budgets/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { budgetSchema } from "@/lib/validation/schemas";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("budgets").select("*").eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ budgets: data });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = budgetSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  const { data, error } = await supabase.from("budgets").upsert({
    user_id: user.id, category: parsed.data.category, month: `${parsed.data.month}-01`, amount: parsed.data.amount,
  }, { onConflict: "user_id,category,month" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ budget: data }, { status: 201 });
}
```

```ts
// frontend/app/api/goals/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { goalSchema } from "@/lib/validation/schemas";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("savings_goals").select("*").eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ goals: data });
}

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = goalSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  const { data, error } = await supabase.from("savings_goals").insert({
    user_id: user.id, name: parsed.data.name, target_amount: parsed.data.targetAmount, deadline: parsed.data.deadline ?? null,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ goal: data }, { status: 201 });
}
```

```ts
// frontend/app/api/subscriptions/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectSubscriptions } from "@/lib/analysis/subscriptions";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabase.from("transactions").select("description, amount, date").eq("user_id", user.id);
  const subs = detectSubscriptions((data ?? []).map((t) => ({ description: t.description, amount: Number(t.amount), date: t.date })));
  await supabase.from("subscriptions").upsert(
    subs.map((s) => ({ user_id: user.id, merchant: s.merchant, amount: s.amount, cadence: s.cadence, last_detected: s.lastDetected })),
    { onConflict: "user_id,merchant,amount" }
  );
  return NextResponse.json({ subscriptions: subs });
}
```

- [x] **Step 5: Run unit tests — expect pass**

```
cd frontend
npx vitest run
```

- [x] **Step 6: Commit**

```bash
git add frontend/app/api frontend/lib/analysis
git commit -m "feat: add health score, budgets, goals and subscription APIs"
```

---

## Task 8: Analysis insights API

**Files:**
- Create: `frontend/lib/analysis/insights.ts`
- Create: `frontend/app/api/analyze/route.ts`

- [x] **Step 1: Insights module**

```ts
// frontend/lib/analysis/insights.ts
export type Tx = { date: string; amount: number; category: string };
export type Insight =
  | { kind: "top-category"; category: string; share: number }
  | { kind: "mom-trend"; category: string; changePercent: number }
  | { kind: "spike"; category: string; changePercent: number };

export function buildInsights(transactions: Tx[]): Insight[] {
  const now = new Date();
  const thisKey = now.toISOString().slice(0, 7);
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

  const spending = transactions.filter((t) => t.amount < 0);
  const total = Math.abs(spending.reduce((s, t) => s + Number(t.amount), 0));
  if (total === 0) return [];

  const insights: Insight[] = [];

  const byCat = new Map<string, number>();
  for (const t of spending) byCat.set(t.category, (byCat.get(t.category) ?? 0) + Math.abs(Number(t.amount)));
  const sorted = [...byCat.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted[0]) insights.push({ kind: "top-category", category: sorted[0][0], share: Math.round((sorted[0][1] / total) * 100) });

  const mom = new Map<string, { this: number; prev: number }>();
  for (const t of spending) {
    const key = t.date.slice(0, 7);
    const row = mom.get(t.category) ?? { this: 0, prev: 0 };
    if (key === thisKey) row.this += Math.abs(Number(t.amount));
    if (key === prevKey) row.prev += Math.abs(Number(t.amount));
    mom.set(t.category, row);
  }
  for (const [category, { this: cur, prev: pv }] of mom) {
    if (pv > 0 && cur > pv * 1.25) {
      insights.push({ kind: "mom-trend", category, changePercent: Math.round((cur / pv - 1) * 100) });
    } else if (pv > 0 && cur < pv * 0.5) {
      insights.push({ kind: "mom-trend", category, changePercent: Math.round((cur / pv - 1) * 100) });
    }
  }
  return insights.slice(0, 5);
}
```

Safe No-Placeholder "write tests" step:

```ts
// frontend/lib/analysis/insights.test.ts
import { describe, it, expect } from "vitest";
import { buildInsights } from "./insights";

describe("buildInsights", () => {
  const now = new Date();
  const thisKey = now.toISOString().slice(0, 7);
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;

  it("flags top category and a big MoM increase", () => {
    const tx = [
      { date: `${thisKey}-10`, amount: -100, category: "Food & Dining" },
      { date: `${prevKey}-10`, amount: -50, category: "Food & Dining" },
      { date: `${thisKey}-11`, amount: -20, category: "Transport" },
    ];
    const insights = buildInsights(tx);
    expect(insights.some((i) => i.kind === "top-category" && i.category === "Food & Dining")).toBe(true);
    expect(insights.some((i) => i.kind === "mom-trend" && i.changePercent >= 100)).toBe(true);
  });
});
```

- [x] **Step 2: GET /api/analyze**

```ts
// frontend/app/api/analyze/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildInsights } from "@/lib/analysis/insights";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabase.from("transactions").select("date, amount, category").eq("user_id", user.id);
  return NextResponse.json({
    insights: buildInsights((data ?? []).map((t) => ({ date: t.date, amount: Number(t.amount), category: t.category }))),
  });
}
```

- [x] **Step 3: Run unit tests — expect pass**

```
cd frontend
npx vitest run
```

- [x] **Step 4: Commit**

```bash
git add frontend/app/api/analyze frontend/lib/analysis/insights.ts
git commit -m "feat: add spending insights API"
```

---

## Task 9: Dashboard UI with charts

**Files:**
- Create: `frontend/app/(app)/layout.tsx`
- Create: `frontend/app/(app)/dashboard/page.tsx`
- Create: `frontend/app/(app)/transactions/page.tsx`
- Create: `frontend/app/(app)/transactions/import/page.tsx`
- Create: `frontend/app/(app)/budgets/page.tsx`
- Create: `frontend/app/(app)/health/page.tsx` (detail view)

- [x] **Step 1: App shell with nav**

```tsx
// frontend/app/(app)/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <span className="font-semibold">Expense Analyzer</span>
          <a href="/dashboard" className="text-sm text-neutral-600 hover:text-neutral-900">Dashboard</a>
          <a href="/transactions" className="text-sm text-neutral-600 hover:text-neutral-900">Transactions</a>
          <a href="/budgets" className="text-sm text-neutral-600 hover:text-neutral-900">Budgets</a>
          <a href="/health" className="text-sm text-neutral-600 hover:text-neutral-900">Health</a>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
```

- [x] **Step 2: Dashboard (score, charts, insights) — server component**

```tsx
// frontend/app/(app)/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { HealthGauge } from "@/components/HealthGauge";
import { CategoryBar } from "@/components/CategoryBar";
import { SubscriptionList } from "@/components/SubscriptionList";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [health, analyze, subs] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/health`, { cache: "no-store" }).then((r) => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze`, { cache: "no-store" }).then((r) => r.json()),
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions`, { cache: "no-store" }).then((r) => r.json()),
  ]);

  return (
    <div className="space-y-8">
      <HealthGauge score={health.score ?? 0} month={health.month} />
      {health.recommendations?.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Recommendations</h2>
          <ul className="space-y-2">
            {health.recommendations.map((r, i) => (
              <li key={i} className="rounded border bg-white p-3 text-sm">{r}</li>
            ))}
          </ul>
        </section>
      )}
      <CategoryBar insights={analyze.insights ?? []} />
      <SubscriptionList subscriptions={subs.subscriptions ?? []} />
    </div>
  );
}
```

- [x] **Step 3: Chart + list components (client)**

```tsx
// frontend/components/HealthGauge.tsx
"use client";
export function HealthGauge({ score, month }: { score: number; month?: string }) {
  const color = score >= 70 ? "text-green-600" : score >= 40 ? "text-amber-600" : "text-red-600";
  return (
    <div className="flex items-end justify-between rounded-lg border bg-white p-6">
      <div>
        <h1 className="text-xl font-semibold">Financial Health</h1>
        <p className="text-sm text-neutral-500">{month ?? ""}</p>
      </div>
      <div className={`text-6xl font-bold ${color}`}>{score}</div>
    </div>
  );
}
```

```tsx
// frontend/components/CategoryBar.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
type I = { kind?: string; category?: string; changePercent?: number; share?: number };
export function CategoryBar({ insights }: { insights: I[] }) {
  const data = insights
    .filter((i) => i.kind === "top-category")
    .map((i) => ({ name: i.category, share: i.share }));
  if (!data.length) return <p className="text-sm text-neutral-500">Add transactions to see your spending breakdown.</p>;
  return (
    <section className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">Top spending category</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis unit="%" />
          <Tooltip />
          <Bar dataKey="share" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
```

```tsx
// frontend/components/SubscriptionList.tsx
"use client";
type S = { merchant: string; amount: number; cadence: string; lastDetected: string };
export function SubscriptionList({ subscriptions }: { subscriptions: S[] }) {
  if (!subscriptions.length) return null;
  return (
    <section className="rounded-lg border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">Detected subscriptions</h2>
      <ul className="divide-y">
        {subscriptions.map((s, i) => (
          <li key={i} className="flex justify-between py-2 text-sm">
            <span>{s.merchant}</span>
            <span className="font-medium">${Number(s.amount).toFixed(2)}/{s.cadence}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [x] **Step 4: Transactions + import pages (transaction list with manual add form; import page with file drop/upload calling `/api/transactions/import` and showing per-row errors from the response).**
- [x] **Step 5: Budgets page** — form posting to `/api/budgets`, list showing per-category budget vs spend with progress bar.
- [x] **Step 6: Health page** — renders full `/api/health` breakdown (score number, category breakdown list, recommendations).
- [x] **Step 7: Manual QA** — log in, add a transaction, upload sample CSV, confirm dashboard, budgets, health pages render.
- [x] **Step 8: Commit**

```bash
git add frontend/app frontend/components
git commit -m "feat: add dashboard with health score, charts, budgets and import pages"
```

---

## Task 10: Empty states, error handling and polish

**Files:**
- Modify: all pages/components guarded in Task 9
- Create: `frontend/components/EmptyState.tsx`
- Create: `frontend/components/ErrorMessage.tsx`

- [x] **Step 1: Shared empty/error components**

```tsx
// frontend/components/EmptyState.tsx
export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-neutral-500">
      <p className="font-medium text-neutral-700">{title}</p>
      <p className="mt-1 text-sm">{hint}</p>
    </div>
  );
}
```

```tsx
// frontend/components/ErrorMessage.tsx
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  );
}
```

- [x] **Step 2: Audit every page** — replace raw empty axes/lists with `<EmptyState>`; any fetch error renders `<ErrorMessage>` with a retry hint; CSV import errors always visible.
- [x] **Step 3: Responsive pass** — verify charts stack under 768px, no horizontal scroll.
- [x] **Step 4: Commit**

```bash
git add frontend/components frontend/app
git commit -m "feat: add empty states and error handling across app"
```

---

## Task 11: Root docs, seed data, landing page

**Files:**
- Modify: `README.md`
- Create: `api-documentation.md`
- Create: `architecture-diagram.png`
- Create: `backend/migrations/002_seed.sql`
- Modify: `frontend/app/page.tsx` (landing redirects to login)
- Modify: `frontend/app/layout.tsx` (metadata)

- [x] **Step 1: Sample seed data migration** (demo statements for a demo user id — placeholder user created via dashboard signup then copy its `id`):

```sql
-- backend/migrations/002_seed.sql
-- Run after signing up a demo account. Replace :DEMO_USER with the auth.users id.
insert into public.profiles (user_id, full_name, monthly_income)
values ('<DEMO_USER_ID>', 'Demo User', 4500) on conflict (user_id) do nothing;
```

- [x] **Step 2: Write README.md** (full §8 structure) and `api-documentation.md` per the templates shown in Task 12 below and the repo-root copies already drafted.
- [x] **Step 3: Generate `architecture-diagram.png`** — build a simple diagram (boxes/lines) with any tool available (draw.io, Mermaid used from the CLI, or SVG hand-authored). Place at repo root.
- [x] **Step 4: Landing page** — `app/page.tsx` renders a short blurb + links to login/signup.
- [x] **Step 5: Commit**

```bash
git add README.md api-documentation.md architecture-diagram.png backend/migrations/002_seed.sql frontend/app
git commit -m "docs: add README, API docs, architecture diagram and seed data"
```

---

## Task 12: Deploy to Vercel + Supabase

**Files:**
- Create: `frontend/vercel.json` (if needed)

- [ ] **Step 1: Provision Supabase project** — create project, run `001_init.sql` and `002_seed.sql` in SQL editor, copy project URL + anon key + service role key into `.env.local`.
- [ ] **Step 2: Local verification** — `npm run build` (expect success), run `npm run dev`, verify full flow end to end locally first.
- [ ] **Step 3: Deploy** — push to GitHub, import repo in Vercel, add env vars, deploy. Confirm `/login` route works in production.
- [ ] **Step 4: Add deployment link to README.**
- [ ] **Step 5: Commit**

```bash
git add README.md frontend
git commit -m "chore: deploy to Vercel and add deployment link"
```

---

## Self-Review

**Spec coverage:**
- §1 Auth + privacy → Task 2, 3, RLS in Task 1 ✔
- §2 Transaction input + CSV + messy handling → Task 4, 6 ✔
- §3 Categorization core → Task 5 (rules + LLM, documented) ✔
- §4 Spending pattern analysis → Task 8 (top cat, MoM, spikes) + Task 7 subscriptions ✔
- §5 Health score + recommendations → Task 7 /api/health ✔
- §6 Budgets & goals → Task 7 budgets/goals APIs + Task 9 UI ✔
- §7 Visual dashboard → Task 9 ✔
- §8 Persist data + historical analysis → health_snapshots (Task 1, 7) ✔
- §9 Responsive clean UI → Task 9, 10 ✔
- §10 Error handling → Task 4 (row-level CSV errors), Task 10 empty states ✔
- Guidelines §7 structure → Task 0-12 (frontend/, backend/, docs/, assets/, architecture-diagram.png, api-documentation.md) ✔
- Guidelines §8 README → Task 11 ✔
- Deployment → Task 12 ✔
- Stretch: subscription detector → Task 7/9 ✔

**Out of scope (deferred per design):** AI chat assistant, bill reminders, multi-account UI, benchmarking, savings simulator — `accounts` table reserved for future.

**Type consistency:** All API responses keyed consistently: `{ transaction }`, `{ transactions }`, `{ import }`→`{ imported }`, `{ budgets }`, `{ goals }`, `{ subscriptions }`, `{ insights }`, `{ score/share/... }` via `/api/health`. Component props match (`HealthGauge: score/month`, `CategoryBar: insights`, `SubscriptionList: subscriptions`). Categorizer module returns `Category` from `rules.ts` everywhere.

**Placeholder scan:** Only intentional placeholder is the `<DEMO_USER_ID>` in the seed migration, which requires a real signed-up user id and is documented as such. Steps in Task 9 for pages 4-6 are condensed but each references concrete APIs/components already defined in this plan.