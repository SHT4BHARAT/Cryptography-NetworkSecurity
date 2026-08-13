// frontend/app/api/transactions/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Controllable mock of the SSR Supabase client. `from()` returns a fluent query
// object that is awaitable ({ data, error }) so route handlers behave normally.
const mocks = vi.hoisted(() => {
  const state: {
    user: { id: string } | null;
    data: unknown;
    error: unknown;
    inData: unknown[];
  } = { user: { id: "user-1" }, data: null, error: null, inData: [] };

  const makeQuery = () => {
    const q: any = {};
    // Awaiting the chained query resolves to the configured data/error.
    q.then = (onF: (v: unknown) => unknown) =>
      Promise.resolve({ data: state.data, error: state.error }).then(onF);
    q.select = () => q;
    q.eq = () => q;
    q.order = () => q;
    q.limit = () => q;
    q.gte = () => q;
    q.lt = () => q;
    q.insert = () => q;
    q.update = () => q;
    q.upsert = () => q;
    q.single = () => q;
    q.maybeSingle = () => q;
    // `.in(...)` is awaited directly (returns data list).
    q.in = () =>
      Promise.resolve({ data: state.inData, error: null });
    return q;
  };

  const createClient = vi.fn(async () => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: state.user } })) },
    from: vi.fn(() => makeQuery()),
  }));

  return { state, createClient };
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { POST, GET } from "./route";

beforeEach(() => {
  mocks.state.user = { id: "user-1" };
  mocks.state.data = null;
  mocks.state.error = null;
  mocks.state.inData = [];
});

describe("POST /api/transactions", () => {
  it("returns 401 when unauthenticated", async () => {
    mocks.state.user = null;
    const res = await POST(
      new Request("http://localhost/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          date: "2026-08-10",
          amount: -12.99,
          description: "NETFLIX",
        }),
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid payload", async () => {
    const res = await POST(
      new Request("http://localhost/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          date: "not-a-date",
          amount: "nope",
          description: "",
        }),
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid input");
    expect(body.issues).toBeDefined();
  });

  it("creates a transaction and returns it", async () => {
    mocks.state.data = { id: "tx-1", amount: -12.99, category: "Subscriptions" };
    const res = await POST(
      new Request("http://localhost/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          date: "2026-08-10",
          amount: -12.99,
          description: "NETFLIX.COM",
        }),
      })
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.transaction.id).toBe("tx-1");
  });
});

describe("GET /api/transactions", () => {
  it("returns 401 when unauthenticated", async () => {
    mocks.state.user = null;
    const res = await GET(new Request("http://localhost/api/transactions"));
    expect(res.status).toBe(401);
  });

  it("lists transactions and exposes a cursor when a page is full", async () => {
    mocks.state.data = [
      { id: "a", date: "2026-08-10" },
      { id: "b", date: "2026-08-05" },
    ];
    const res = await GET(
      new Request("http://localhost/api/transactions?limit=2")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.transactions).toHaveLength(2);
    expect(body.nextCursor).toBe("2026-08-05");
  });

  it("returns null cursor when the page is not full", async () => {
    mocks.state.data = [{ id: "a", date: "2026-08-10" }];
    const res = await GET(
      new Request("http://localhost/api/transactions?limit=50")
    );
    const body = await res.json();
    expect(body.nextCursor).toBeNull();
  });
});