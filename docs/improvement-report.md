# Improvement & Enhancement Report — RICR-HIM-1272

**Project:** Smart Expense Analyzer & Financial Health Dashboard — HackInMotion 2026
**Generated:** 13 Aug 2026 — branch `Master` (build ✓, tests ✓ 19/19)

## 1. Current Status

| Area | Status |
| ---- | ------ |
| Production build (`next build`) | ✅ Passes — all 18 routes compiled |
| Unit tests (`vitest run`) | ✅ 19/19 passing (5 suites) |
| Lint / tooling | ⚠️ ESLint not verified (timed out); vitest config has ESM/CJS warning |
| Database | ✅ Schema + RLS + seed present; `health_snapshots` persisted via `/api/health` |
| Implementation plan | ✅ Tasks 0–11 complete; Task 12 (deploy) outstanding |
| Git hygiene | ⚠️ 27 modified + 5 untracked files uncommitted; `Master` and `main` diverge |
| Secrets | ✅ None committed (only `.env.example`) |
| Deliverables | ⚠️ README team/screenshots/deploy-link/presentation still placeholders |

## 2. Critical / High Priority

**2.1 Git hygiene.** A large volume of finished work (new "ledger/paper" theme, untracked `profile` page/API, `PulseLine`, `services.ts`) is uncommitted; hackathon rules require consistent commits reviewed daily. → Commit the stable tree (build + tests green) as one clean commit, then commit in small descriptive units. Also reconcile `Master` vs `main` (origin/HEAD → `main`): pick one canonical branch, push, delete the stale one.

**2.2 Deployment (plan Task 12) unfinished.** README still says "Live demo: (add Vercel URL)". → Finish Supabase/Vercel deploy; fill live link, screenshots, team name/members, and the "categorization approach" write-up required by the General Instructions.

**2.3 No API-route test coverage.** All 19 tests are pure `lib/` unit tests; the entire write path (`/api/transactions`, `import`, `categorize`, `budgets`, `goals`) is untested. → Add integration/contract tests (mock Supabase): 401 guard, zod 400s, CSV dedupe, categorize upsert. Add component tests for dashboard/transactions.

## 3. Security & Robustness

**3.1 CSV upload unbounded.** `/api/transactions/import` has no file-size cap, no row cap, no content-type check (DoS / memory risk). → Enforce max size + row count (413/400) and validate `Content-Type`.

**3.2 No rate limiting** on authenticated writes. → Add per-user throttling (in-memory, DB, or host-level).

**3.3 Service-role key documented but unused.** README/docs list `SUPABASE_SERVICE_ROLE_KEY` and a `lib/supabase/admin.ts` that was never created. → Either add a guarded server-only admin client or remove the key/docs (prefer removal / least privilege).

**3.4 LLM cost/latency controls.** `categorize.ts` re-hits the LLM on every re-categorize (8s timeout, no cache). → Cache outcomes, skip already-failed rows, make timeout/model configurable.

**3.5 Inconsistent categorization.** Import uses rules only; `/api/categorize` + manual POST add an LLM fallback, so imported unmatched rows never get LLM help unless the user manually re-categorizes. → Route import through the same `categorizeBatch` path.

## 4. Performance

**4.1 Duplicated fetches on dashboard.** Dashboard calls `getHealth/getAnalyze/getSubscriptions` services, each re-fetching the full transaction set. → Fetch once; derive score/insights/subscriptions in memory.

**4.2 No pagination/limits.** `GET /api/transactions` and dashboard load all rows; budgets page refetches `/api/transactions` separately. Financial data grows unbounded. → Add limit/cursor pagination, push month/category filters into queries, consolidate budgets onto its API.

## 5. UX / Accessibility / i18n

**5.1 Currency hardcoded `$`.** All formatting uses `toFixed(2)` with literal `$`; not locale/currency aware. → Add a central `formatMoney(currency, locale)` util; consider an explicit currency column for multi-currency.

**5.2 Chart/gauge accessibility.** Recharts lack `aria` labels; health gauge is color-only. → Add `role="img"`/`aria-label`, text equivalents, and run an axe audit; verify theme contrast (`--ledger` on `--paper`) passes WCAG AA.

**5.3 Loading/error states.** Pages show bare "Loading…" and no top-level error boundary — can leave a blank screen (problem-statement req. #10). → Add skeletons and `error.tsx`.

**5.4 Landing page hardcodes a static sample score (78).** Fine for marketing; label it clearly or make it configurable.

## 6. Code Quality & Maintainability

**6.1 Tooling.** ESLint timed out; `vitest.config.ts` is ESM-in-CJS. → Add `"type": "module"` (or rename `.mjs`), get `eslint .` green, add a repo-wide CI that runs `lint && test && build`.

**6.2 Duplicated scoring.** Health-score computation is duplicated in `/api/health/route.ts` and `lib/analysis/services.ts`. → Extract one `computeHealthData(supabase, userId)` used by both; avoid drift.

**6.3 Dev output in tree.** `.next/`, `tsconfig.tsbuildinfo`, `node_modules` present under root. → Confirm root + frontend `.gitignore` cover all before committing.

## 7. Roadmap (problem-statement-aligned)

1. Smooth CSV→dashboard demo flow. 2. Bill reminders before due dates. 3. AI chat assistant. 4. Multi-account UI (schema already ready). 5. Savings "what-if" simulator. 6. PWA/offline. 7. Anonymized benchmarking.

## 8. Next-Step Checklist

- [ ] Commit stable tree; reconcile `Master`/`main`.
- [ ] Finish deploy; complete README (link, screenshots, team, approach).
- [ ] Add API + component test coverage (mock Supabase).
- [ ] Add upload size/row caps + rate limiting.
- [ ] Resolve service-role key (remove or guard).
- [ ] Consolidate fetches; add pagination.
- [ ] i18n money formatting + a11y/axe pass.
- [ ] Fix vitest warning; green `lint`; add CI script.