# API Documentation

Base URL: `https://<your-deployment>.vercel.app` (locally `http://localhost:3000`).

Authentication: Supabase session cookie, set by `supabase.auth.signInWithPassword`.
All routes return `401 { error: "Unauthorized" }` when no valid session is present.
Server-side row ownership is enforced by Row-Level Security.

---

## POST /api/transactions

Create a single transaction.

**Request body (JSON):**

```json
{
  "date": "2026-08-10",
  "amount": -12.99,
  "description": "NETFLIX.COM",
  "accountId": "3f0f8c7e-0000-0000-0000-000000000000"
}
```

`accountId` optional. `amount` negative = spending, positive = income.

**200** — `{ "transaction": { ... } }`
**400** — `{ "error": "Invalid input", "issues": [zod issue] }`
**401** — unauthorized

---

## GET /api/transactions

List the user's transactions, newest first.

**Query params (all optional):**
- `category` — filter by exact category
- `month` — filter by `YYYY-MM`

**200** — `{ "transactions": [ { id, user_id, account_id, date, amount, description, category, created_at } ] }`

---

## POST /api/transactions/import

Upload a CSV of transactions (simulated bank statement).

**Request:** `multipart/form-data` with field `file` (CSV). Expected columns in
any order: date, description, amount (first 3 columns are used).

**200** — `{ "imported": 42, "skippedDuplicates": 3, "errors": [ { "line": 12, "reason": "Invalid amount: \"nope\"" } ] }`

Rows are processed independently: valid rows import even when others fail.
Dates accepted: ISO (`2024-03-01`), DMY (`01-03-2024`), slash (`01/03/2024`).
Amounts tolerate `$`, `,`, and whitespace.

---

## POST /api/categorize

Retroactively re-categorize up to 200 currently-`Uncategorized` rows using the
rules engine plus optional LLM fallback.

**200** — `{ "updated": 17 }`

---

## GET /api/health

Compute and return the user's financial health score for the current month.

**200** — `{ "month": "2026-08", "score": 72, "savingsRate": 35, "spendingVsIncome": 65, "budgetAdherence": 88, "recommendations": ["..."] }`

- `score` — 0–100
- `savingsRate` — `null` when no income is known
- `recommendations` — derived from actual data, never hardcoded
- Also `UPSERT`s a row into `health_snapshots` for score history.

---

## GET /api/analyze

Spending insights derived from the user's own transactions.

**200** — `{ "insights": [ { "kind": "top-category", "category": "Food & Dining", "share": 41 }, { "kind": "mom-trend", "category": "Transport", "changePercent": 68 } ] }`

Kinds: `top-category`, `mom-trend` (month-over-month), `spike`.

---

## GET /api/subscriptions

Detect recurring monthly subscriptions from transaction history (merchant +
amount grouped, >= 3 occurrences, 25–35 day cadence).

**200** — `{ "subscriptions": [ { "merchant": "netflix com", "amount": 12.99, "cadence": "monthly", "occurrences": 4, "lastDetected": "2026-08-05" } ] }`

---

## GET /api/budgets

List the user's budgets.

**200** — `{ "budgets": [ { id, category, month, amount } ] }`

---

## POST /api/budgets

Create or update a budget (upsert on `user_id, category, month`).

**Request body:**

```json
{ "category": "Food & Dining", "month": "2026-08", "amount": 300 }
```

**201** — `{ "budget": { ... } }`
**400** — invalid input

---

## GET /api/goals

List the user's savings goals.

**200** — `{ "goals": [ { id, name, target_amount, saved_amount, deadline } ] }`

---

## POST /api/goals

Create a savings goal.

**Request body:**

```json
{ "name": "Emergency fund", "targetAmount": 10000, "deadline": "2026-12-31" }
```

**201** — `{ "goal": { ... } }`
**400** — invalid input

---

## GET /api/auth/me

Current user + profile.

**200** — `{ "user": { "id", "email" }, "profile": { "full_name", "monthly_income" } }`
**401** — no session

---

## Error format

All errors follow `{ "error": "<message>" }`, with validation errors adding
`"issues": [ { "code", "message", "path" } ]`.

| Status | Meaning                                       |
| ------ | --------------------------------------------- |
| 400    | Invalid input / DB constraint violation       |
| 401    | Missing or invalid session                    |
| 500    | Unexpected server error                       |
