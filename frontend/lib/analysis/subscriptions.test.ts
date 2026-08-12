// frontend/lib/analysis/subscriptions.test.ts
import { describe, it, expect } from "vitest";
import { detectSubscriptions } from "./subscriptions";

describe("detectSubscriptions", () => {
  it("flags recurring monthly charges", () => {
    const tx = [
      { description: "Netflix", amount: -9.99, date: "2026-01-05" },
      { description: "Netflix", amount: -9.99, date: "2026-02-05" },
      { description: "Netflix", amount: -9.99, date: "2026-03-05" },
      { description: "Coffee", amount: -5, date: "2026-03-06" },
    ];
    const subs = detectSubscriptions(tx, 3);
    expect(subs).toHaveLength(1);
    expect(subs[0].merchant).toContain("netflix");
  });

  it("ignores one-off purchases", () => {
    const tx = [
      { description: "Coffee", amount: -5, date: "2026-01-06" },
      { description: "Coffee", amount: -6, date: "2026-02-09" },
      { description: "Coffee", amount: -5.5, date: "2026-03-12" },
    ];
    expect(detectSubscriptions(tx, 3)).toHaveLength(0);
  });
});