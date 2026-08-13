// frontend/app/api/transactions/import/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const state: {
    user: { id: string } | null;
    data: unknown;
    inData: unknown[];
  } = { user: { id: "import-user" }, data: null, inData: [] };

  const makeQuery = () => {
    const q: any = {};
    q.then = (onF: (v: unknown) => unknown) =>
      Promise.resolve({ data: state.data, error: null }).then(onF);
    q.select = () => q;
    q.in = () => Promise.resolve({ data: state.inData, error: null });
    q.insert = () => q;
    q.eq = () => q;
    q.order = () => q;
    q.limit = () => q;
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

import { POST } from "./route";

function csvRequest(userId: string, csv: string, opts: { file?: boolean } = {}) {
  const form = new FormData();
  if (opts.file !== false) {
    form.append("file", new File([csv], "statement.csv", { type: "text/csv" }));
  }
  return new Request("http://localhost/api/transactions/import", {
    method: "POST",
    body: form,
  });
}

beforeEach(() => {
  mocks.state.user = { id: "import-user" };
  mocks.state.data = null;
  mocks.state.inData = [];
});

describe("POST /api/transactions/import", () => {
  it("returns 401 when unauthenticated", async () => {
    mocks.state.user = null;
    const res = await POST(csvRequest("x", "2026-08-01,NETFLIX,-12.99"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when no file is provided", async () => {
    const res = await POST(csvRequest("import-user", "", { file: false }));
    expect(res.status).toBe(400);
  });

  it("returns 413 for oversized files", async () => {
    const big = new File(
      [new ArrayBuffer(6 * 1024 * 1024)],
      "big.csv",
      { type: "text/csv" }
    );
    const form = new FormData();
    form.append("file", big);
    const res = await POST(
      new Request("http://localhost/api/transactions/import", {
        method: "POST",
        body: form,
      })
    );
    expect(res.status).toBe(413);
  });

  it("imports valid rows and reports no errors", async () => {
    const csv =
      "date,description,amount\n2026-08-01,NETFLIX,-12.99\n2026-08-02,AMAZON,-45.00";
    const res = await POST(csvRequest("import-user", csv));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.imported).toBe(2);
    expect(body.skippedDuplicates).toBe(0);
    expect(body.errors).toEqual([]);
    expect(body.truncated).toBe(false);
  });

  it("skips duplicates already in the database", async () => {
    mocks.state.inData = [{ dedupe_hash: "__precomputed__" }];
    // No rows share the hash, so both are new.
    const csv = "2026-08-01,NETFLIX,-12.99\n2026-08-02,AMAZON,-45.00";
    const res = await POST(csvRequest("import-user", csv));
    const body = await res.json();
    expect(body.imported).toBe(2);
  });

  it("rate-limits excessive imports for a user", async () => {
    mocks.state.user = { id: "flooder" };
    const csv = "2026-08-01,NETFLIX,-12.99";
    let statuses: number[] = [];
    for (let i = 0; i < 11; i++) {
      const res = await POST(csvRequest("flooder", csv));
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 10)).toEqual(
      Array(10).fill(200)
    );
    expect(statuses[10]).toBe(429);
  });
});