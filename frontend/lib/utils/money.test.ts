// frontend/lib/utils/money.test.ts
import { describe, it, expect } from "vitest";
import { formatMoney, formatMoneySigned } from "./money";

describe("formatMoney", () => {
  it("formats an absolute value in the default currency", () => {
    expect(formatMoney(12.99)).toBe("$12.99");
  });

  it("ignores the sign by default", () => {
    expect(formatMoney(-12.99)).toBe("$12.99");
  });

  it("adds a +/- sign when requested", () => {
    expect(formatMoneySigned(12.99)).toBe("+$12.99");
    expect(formatMoneySigned(-12.99)).toBe("-$12.99");
  });

  it("supports a custom currency", () => {
    expect(formatMoney(100, { currency: "INR", locale: "en-IN" })).toBe("₹100.00");
  });
});