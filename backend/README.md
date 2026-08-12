# Backend

The backend is a Supabase (PostgreSQL) project. The SQL lives in
`backend/migrations/` and the HTTP/API layer lives in `frontend/app/api/*`
(Next.js route handlers). Row-Level Security keeps every user's financial
data private.

## Migrations

- `001_init.sql` — full schema + RLS. Run in the Supabase SQL editor.
- `002_seed.sql` — optional demo data for a demo account (replace
  `<DEMO_USER_ID>` with the auth id of a signed-up demo user).

## Endpoint -> handler map

| Method | Endpoint                      | Handler                                    |
| ------ | ----------------------------- | ------------------------------------------ |
| POST   | /api/transactions             | frontend/app/api/transactions/route.ts     |
| GET    | /api/transactions             | frontend/app/api/transactions/route.ts     |
| POST   | /api/transactions/import      | frontend/app/api/transactions/import/route.ts |
| POST   | /api/categorize               | frontend/app/api/categorize/route.ts       |
| POST/GET | /api/budgets                | frontend/app/api/budgets/route.ts          |
| POST/GET | /api/goals                  | frontend/app/api/goals/route.ts            |
| GET    | /api/health                   | frontend/app/api/health/route.ts           |
| GET    | /api/analyze                  | frontend/app/api/analyze/route.ts          |
| GET    | /api/subscriptions            | frontend/app/api/subscriptions/route.ts    |
| GET    | /api/auth/me                  | frontend/app/api/auth/me/route.ts          |

See `../api-documentation.md` for full request/response details.
