// frontend/lib/categorization/categorize.test.ts
import { describe, it, expect } from "vitest";
import { categorizeByRules, mapLlmCategory } from "./rules";

describe("categorizeByRules", () => {
  it("classifies subscription and income by keyword", () => {
    expect(categorizeByRules("NETFLIX.COM 12.99", -12.99)).toBe("Subscriptions");
    expect(categorizeByRules("SALARY AUGUST", 3000)).toBe("Income");
  });
  it("returns null when nothing matches", () => {
    expect(categorizeByRules("xyz random vendor", -5)).toBeNull();
  });
});

describe("mapLlmCategory", () => {
  it("maps common labels", () => {
    expect(mapLlmCategory("Food and Dining")).toBe("Food & Dining");
    expect(mapLlmCategory("billsUtilities")).toBe("Bills & Utilities");
    expect(mapLlmCategory("gibberish")).toBe("Uncategorized");
  });
  it("never maps an empty/unconfigured LLM reply to a real category", () => {
    expect(mapLlmCategory("")).toBe("Uncategorized");
    expect(mapLlmCategory("   ")).toBe("Uncategorized");
    expect(mapLlmCategory(undefined as unknown as string)).toBe("Uncategorized");
  });
});