# Data Flow Diagram

This document describes how data moves through the Smart Expense Analyzer & Financial Health Dashboard.

## System Context

```
┌────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                        │
│   React (Next.js App Router) — pages + forms + Recharts        │
└──────────────────────────────┬─────────────────────────────────┘
                               │ HTTPS (JWT/session cookie)
                               ▼
┌────────────────────────────────────────────────────────────────┐
│                       Next.js Server (Vercel)                  │
│   app/page.tsx (SSR pages)        app/api/* (route handlers)   │
│   lib/categorization              lib/analysis                 │
│   lib/utils/csv                   middleware.ts (auth guard)   │
└─────────┬──────────────────────────────────┬───────────────────┘
          │ Supabase client (@supabase/ssr) │ (optional) LLM grader
          ▼                                 ▼
┌──────────────────┐            ┌───────────────────────┐
│  Supabase        │            │  LLM API (OpenAI-     │
│  Postgres + Auth │            │  compatible), e.g.    │
│  (RLS enabled)   │            │  gpt-4o-mini          │
└──────────────────┘            └───────────────────────┘
```

## Primary Data Flows

### 1. Authentication flow

```
User (login page) → supabase.auth.signInWithPassword()
   → Supabase Auth issues session (JWT + cookie)
   → middleware.ts validates session on every request
   → Unauthenticated requests to /dashboard etc. redirect to /login
   → All API writes additionally re-verify auth.getUser() server-side
```

### 2. Manual transaction entry

```
Transaction form → POST /api/transactions
   → validate with zod schema (400 + field issues on failure)
   → categorize (rules engine) → category
   → compute dedupe_hash (userId|date|amount|description)
   → INSERT into transactions (RLS enforces user ownership)
   → 201 { transaction }
```

### 3. CSV upload flow

```
CSV file → POST /api/transactions/import (multipart form)
   → papaparse parses rows
   → parseCsv: normalize dates (ISO/DMY/slash), amounts ($ , space),
     collect invalid rows {line, reason}
   → compute dedupe_hash per valid row
   → query existing hashes, filter duplicates
   → categorize each new row (rules engine)
   → bulk INSERT remaining rows
   → 200 { imported, skippedDuplicates, errors }
```

### 4. Categorization engine flow

```
Input: description + amount for each transaction
   → rule-based keyword/market matcher (categorizeByRules)
   → matched?  → return category (no LLM call)
   → unmatched → batch LLM call (/chat/completions, 8s timeout)
                 → LLM result mapped to canonical categories
                 → LLM failure/absence of key → 'Uncategorized' (never throws)
   → used by: POST /api/transactions, /api/transactions/import, /api/categorize
```

### 5. Health score flow

```
GET /api/health
   → load profiles.monthly_income, current-month transactions,
     current-month budgets (parallel queries)
   → compute income = max(profile fallback, actual +amount transactions)
   → spending = Σ negative amounts
   → budgeted, spentOnBudgeted, prev-month spending
   → computeScore(...) → 0-100, savings rate, recommendations
   → UPSERT into health_snapshots (persisted history)
   → 200 { score, recommendations, ... }
```

### 6. Analysis / insights flow

```
GET /api/analyze
   → load all user transactions
   → buildInsights:
       - top spending category by share %
       - month-over-month trend deltas (this month vs prev month)
       - spending spike detection (+25% / -50%)
   → 200 { insights[] }

GET /api/subscriptions
   → load all user transactions
   → detectSubscriptions: group by merchant + amount,
     require >= 3 occurrences, average gap 25–35 days → subscriptions[]
   → UPSERT into subscriptions table
   → 200 { subscriptions[] }
```

### 7. Budgets & goals flow

```
Budgets: POST/GET /api/budgets → zod validate → UPSERT (user_id, category, month) → { budgets }
Goals:   POST/GET /api/goals   → zod validate → INSERT → { goals }
Dashboard reads these along with transactions to render progress bars.
```

## Database Write Paths (Security)

All writes go through Next.js API route handlers. The browser client never
writes directly to Supabase for financial data. This keeps validation,
categorization, and scoring server-side, and gives judges an explicit API
surface. Row-Level Security is additionally enabled on every table so that
even a direct table query can only ever see the authenticated user's own rows.

## Error Handling Paths

| Failure mode             | Behavior                                                        |
| ------------------------ | --------------------------------------------------------------- |
| Malformed CSV            | Bad rows collected `{line, reason}`, valid rows still import    |
| Invalid JSON / fields    | 400 + zod `issues[]` returned to the form                       |
| Categorization failure   | Row tagged `Uncategorized`, logged, request never throws        |
| Empty dataset            | Charts/lists render `EmptyState` with next-step guidance        |
| Auth failure             | 401 from API routes; middleware redirects to /login             |
| DB/network error         | 400/500 + readable `error` message, UI shows `ErrorMessage`     |