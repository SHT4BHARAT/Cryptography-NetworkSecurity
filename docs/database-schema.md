# Database Schema

PostgreSQL database hosted on Supabase. Every financial table is keyed by
`user_id` and protected by Row-Level Security (RLS) so a user can only ever
read or write their own rows.

## Entity Relationship

```
auth.users (Supabase)
   │
   ├──< profiles          (1:1, user_id PK)
   ├──< accounts          (1:N)
   ├──< transactions      (1:N)
   ├──< budgets           (1:N)
   ├──< savings_goals     (1:N)
   ├──< subscriptions     (1:N)
   └──< health_snapshots  (1:N, PK user_id + month)

transactions.account_id ──> accounts.id   (nullable, ON DELETE SET NULL)
```

## Tables

### profiles

| Column          | Type           | Notes                                |
| --------------- | -------------- | ------------------------------------ |
| `user_id`       | uuid PK        | FK -> `auth.users(id)` ON DELETE CASCADE |
| `full_name`     | text           |                                      |
| `monthly_income`| numeric(12,2)  | fallback income when no salary rows  |
| `created_at`    | timestamptz    | default `now()`                      |

### accounts

| Column        | Type           | Notes                              |
| ------------- | -------------- | ---------------------------------- |
| `id`          | uuid PK        | default `gen_random_uuid()`        |
| `user_id`     | uuid NOT NULL  | FK -> `auth.users` CASCADE         |
| `name`        | text NOT NULL  | e.g. "HDFC Card", "Cash"           |
| `type`        | text NOT NULL  | default `'checking'`               |
| `created_at`  | timestamptz    | default `now()`                    |

### transactions

| Column         | Type           | Notes                                        |
| -------------- | -------------- | -------------------------------------------- |
| `id`           | uuid PK        | default `gen_random_uuid()`                  |
| `user_id`      | uuid NOT NULL  | FK -> `auth.users` CASCADE                   |
| `account_id`   | uuid NULL      | FK -> `accounts.id` ON DELETE SET NULL       |
| `date`         | date NOT NULL  |                                              |
| `amount`       | numeric(12,2)  | **signed**: negative = spending, positive = income |
| `description`  | text NOT NULL  | merchant / description                       |
| `category`     | text NOT NULL  | default `'Uncategorized'`                    |
| `dedupe_hash`  | text           | sha256(userId\|date\|amount\|description)    |
| `raw`          | text           | original CSV row (debugging)                 |
| `created_at`   | timestamptz    | default `now()`                              |

Indexes:
- `trx_user_date_idx` on `(user_id, date DESC)`
- Unique partial `trx_dedupe_idx` on `(user_id, dedupe_hash) WHERE dedupe_hash IS NOT NULL`

### budgets

| Column      | Type           | Notes                                      |
| ----------- | -------------- | ------------------------------------------ |
| `id`        | uuid PK        |                                            |
| `user_id`   | uuid NOT NULL  | FK -> `auth.users` CASCADE                 |
| `category`  | text NOT NULL  |                                            |
| `month`     | date NOT NULL  | first day of month (`YYYY-MM-01`)          |
| `amount`    | numeric(12,2)  |                                            |

Constraint: `UNIQUE (user_id, category, month)` — used by `upsert`.

### savings_goals

| Column          | Type           | Notes                              |
| --------------- | -------------- | ---------------------------------- |
| `id`            | uuid PK        |                                    |
| `user_id`       | uuid NOT NULL  | FK -> `auth.users` CASCADE         |
| `name`          | text NOT NULL  | e.g. "Emergency fund"              |
| `target_amount` | numeric(12,2)  |                                    |
| `saved_amount`  | numeric(12,2)  | default `0`                        |
| `deadline`      | date NULL      |                                    |
| `created_at`    | timestamptz    | default `now()`                    |

### subscriptions

| Column          | Type           | Notes                                      |
| --------------- | -------------- | ------------------------------------------ |
| `id`            | uuid PK        |                                            |
| `user_id`       | uuid NOT NULL  | FK -> `auth.users` CASCADE                 |
| `merchant`      | text NOT NULL  | normalized merchant key                    |
| `amount`        | numeric(12,2)  |                                            |
| `cadence`       | text NOT NULL  | default `'monthly'`                        |
| `last_detected` | date NOT NULL  | last occurrence observed                   |
| `active`        | boolean        | default `true`                             |
| `notes`         | text           |                                            |

Constraint: `UNIQUE (user_id, merchant, amount)` — used by `upsert`.

### health_snapshots

| Column        | Type           | Notes                                   |
| ------------- | -------------- | --------------------------------------- |
| `user_id`     | uuid PK        | FK -> `auth.users` CASCADE              |
| `month`       | date PK        | first day of month                      |
| `score`       | int NOT NULL   | 0–100 financial health score            |
| `breakdown`   | jsonb          | score inputs + recommendations          |
| `created_at`  | timestamptz    | default `now()`                         |

Satisfies the "persist historical analysis" requirement and powers the
score-over-time chart.

## Row-Level Security

Each table has `ENABLE ROW LEVEL SECURITY` plus one policy:

```sql
create policy "<table> own"
on public.<table>
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

Applied to: `profiles`, `accounts`, `transactions`, `budgets`,
`savings_goals`, `subscriptions`, `health_snapshots`.

## Derived (not stored)

Top categories, month-over-month trends, savings rate, budget adherence and
score inputs are computed on read from the tables above. Only the final score
+ breakdown is snapshotted per month.

## Migration files

- `backend/migrations/001_init.sql` — full schema + RLS (run in Supabase SQL editor).
- `backend/migrations/002_seed.sql` — demo user profile + sample transactions.

## How to run locally

1. Create a Supabase project.
2. Open the SQL Editor and run `backend/migrations/001_init.sql`.
3. Copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` into `frontend/.env.local`.
4. `cd frontend && npm run dev`.