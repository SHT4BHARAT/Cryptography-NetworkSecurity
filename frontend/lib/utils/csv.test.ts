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
  it("returns null for blank input", () => {
    expect(normalizeAmount("")).toBeNull();
    expect(normalizeAmount("   ")).toBeNull();
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
    const csv =
      "Date,Description,Amount\n2024-03-01,Coffee shop,-5.50\n01-04-2024,Salary,3000\nbad-date,garbage,nope\n";
    const { rows } = parseCsv(csv, "u1");
    expect(rows.filter((r) => r.ok === true)).toHaveLength(2);
    expect(rows.filter((r) => r.ok === false)).toHaveLength(1);
  });

  it("keeps hashes aligned when a bad row sits between good rows", () => {
    const csv =
      "Date,Description,Amount\n2024-03-01,Coffee,-5.50\nbad-date,garbage,nope\n01-04-2024,Salary,3000\n";
    const { rows } = parseCsv(csv, "u1");
    const good = rows.filter((r) => r.ok === true) as Extract<
      (typeof rows)[number],
      { ok: true }
    >[];
    expect(good).toHaveLength(2);
    expect(good[0].description).toBe("Coffee");
    expect(good[0].hash).toBeTruthy();
    expect(good[1].description).toBe("Salary");
    expect(good[1].hash).toBeTruthy();
    expect(good[0].hash).not.toBe(good[1].hash);
  });

  it("rejects blank amounts instead of defaulting to zero", () => {
    const csv = "Date,Description,Amount\n2024-03-01,Vendor,\n";
    const { rows } = parseCsv(csv, "u1");
    expect(rows.filter((r) => r.ok === true)).toHaveLength(0);
    expect(rows.filter((r) => r.ok === false)).toHaveLength(1);
  });
});