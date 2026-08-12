# Smart Expense Analyzer & Financial Health Dashboard — Design

Theme: FinTech & Personal Finance
Hackathon: HackInMotion 2026 (12–15 Aug 2026)
Team Code: RICR-HIM-1272

## Architecture

Single Next.js (App Router) application = frontend + backend API routes, deployed as one unit
on Vercel. Supabase (Postgres + Auth) is the database and identity provider.

```
frontend/               → Next.js application
├── app/                → pages & React components (App Router)
├── app/api/*           → backend API routes (server-side; all writes go through here)
├── lib/                → shared business logic (categorization, analysis, scoring)
└── middleware.ts       → auth session guard

backend/                → Supabase project: SQL migrations, RLS policies, seed data,
                          and endpoint→handler map (see backend/README.md)
```

Why the split looks like this: Next.js route handlers must live inside the app directory, so the
HTTP layer sits in `frontend/app/api`. `backend/` holds the other half of the server — the schema,
row-level security policies and migrations — which is real, reviewable backend work rather than a
placeholder. `api-documentation.md` and `backend/README.md` both point at the concrete handler
files so the server layer is easy to find. Guidelines §7 permits this as long as the structure stays
clean and professional.

The client never talks to Supabase directly for writes. RLS would make it safe, but routing through
API handlers keeps validation, categorization and scoring server-side and gives judges a real API
surface to inspect.

## Core Modules

1. **Auth** — Supabase Auth (email/password), server-side session guard, Row-Level Security on all
   financial tables so data stays private per user.
2. **Transactions** — manual add + CSV upload (simulated bank statement format). Tolerant parsing:
   multiple date formats, missing fields, dedupe of duplicate entries. `amount` is signed —
   negative is spending, positive is income — so salary and refunds land in the same table.
3. **Categorization Engine** (`lib/categorization/`) — rule-based keyword/merchant matcher covering
   the full demo dataset, with an optional LLM (OpenAI-compatible) enrichment pass for unmatched
   rows. The LLM is never on the critical path: if the key is missing, the call fails, or it times
   out, the row falls back to `Uncategorized` and the user can retag it. Results cached. Approach
   and rationale documented in the README per requirement 3.
4. **Analysis** — top spending categories, month-over-month trends, recurring/subscription
   detection, unusual spending spikes, savings rate. All computed from the user's own rows.
5. **Financial Health Score** — 0–100 derived from spending-vs-income, savings rate and budget
   adherence, plus plain-language recommendations generated from the user's actual data. Income
   comes from positive-amount transactions; users who only upload expenses can set
   `profiles.monthly_income` as a fallback so the score always has a denominator.
6. **Budgets & Goals** — monthly budgets per category and savings goals, with progress tracking and
   overspending alerts.
7. **Dashboard** — charts (Recharts): spending breakdown, trends over time, budget progress, health
   score, and score history from stored snapshots.
8. **Subscription Detector** (stretch) — flags recurring charges by matching merchant + similar
   amount + roughly monthly cadence over existing transaction data. Chosen as the single advanced
   feature because it reuses data already in the table and demos well.

## Database (Supabase Postgres)

Tables: `profiles`, `accounts`, `transactions`, `categories`, `budgets`, `savings_goals`,
`subscriptions`, `health_snapshots` — all keyed by `user_id` with RLS enforced.

- `profiles` — `monthly_income` fallback and user settings.
- `transactions` — signed `amount`; a `(user_id, date, amount, description)` hash column backs
  import dedupe.
- `health_snapshots` — one row per user per month: `score` plus a `breakdown` jsonb. Satisfies the
  "persist historical analysis" half of requirement 8 and powers the score-over-time chart.

Everything else (top categories, trends, savings rate) is derived on read — no reason to store what
a query answers.

## UI & Responsiveness (Requirement 9)

Mobile-first layout; charts stack to a single column below the tablet breakpoint and stay readable
without horizontal scroll. Calm, restrained palette — muted neutrals with one accent, generous
spacing, no alarm-red except for genuine overspend. Numbers are always paired with a label and a
comparison so the dashboard is understandable in seconds. Keyboard-navigable forms and labelled
inputs throughout.

## Error Handling (Requirement 10)

No screen is ever blank or broken.

- **CSV import** — parsed row by row. Bad rows are collected and reported back with line numbers and
  reasons; valid rows still import. A malformed file never rejects the whole upload silently.
- **Invalid transaction input** — validated server-side in the API route, field-level messages
  returned to the form.
- **Categorization failure** — falls back to `Uncategorized`, logged, never throws into the request.
- **Empty datasets** — every chart and list has an empty state that explains what to do next
  (add a transaction, upload a CSV) instead of rendering an empty axis.
- **Score with insufficient data** — shows what's missing (e.g. "add income to see your savings
  rate") rather than a misleading zero.

## Team & Git Workflow

Guidelines §6 requires a minimum of 10 meaningful commits per participant, spread across the three
days, with daily repository review. Module ownership is split so every member has an independent
commit stream and can answer the technical viva on their own area:

- Auth, profiles, RLS policies, middleware
- Transaction input, CSV parsing, dedupe, error reporting
- Categorization engine and spending analysis
- Health score, budgets/goals, dashboard and charts

Work on feature branches, merge to `main` via Pull Requests with descriptive titles.

## Deliverables

- Deployed full-stack application (Vercel + Supabase) — frontend + backend + database.
- GitHub repository following naming/structure guidelines, including `architecture-diagram.png`,
  `api-documentation.md`, `presentation.pptx`, and a complete README per §8 — including which
  categorization approach was used, why, and how it's integrated.
- Live demo with real/sample transaction data being uploaded, categorized, and turned into a
  financial health summary.
- Product pitch covering problem, solution, tech stack, real-world impact, and future scope.

## Deferred

AI chat assistant, bill reminders, multi-account UI, benchmarking and the savings simulator are
out of scope for the hackathon window. `accounts` exists in the schema so multi-account is a UI
change later, not a migration. Revisit once all ten must-haves are working end to end.
