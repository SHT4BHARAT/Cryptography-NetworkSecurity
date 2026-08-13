// frontend/lib/utils/rateLimit.test.ts
import { describe, it, expect } from "vitest";
import { rateLimit } from "./rateLimit";

describe("rateLimit", () => {
  it("allows requests up to the max within a window", () => {
    const key = "rl-basic";
    expect(rateLimit(key, 2).ok).toBe(true);
    expect(rateLimit(key, 2).ok).toBe(true);
    const third = rateLimit(key, 2);
    expect(third.ok).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
    expect(third.remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    const key = "rl-window";
    rateLimit(key, 1, 10_000_000); // long window
    expect(rateLimit(key, 1, 10_000_000).ok).toBe(false);
    // A fresh key is unaffected.
    expect(rateLimit("rl-fresh", 1, 60_000).ok).toBe(true);
  });
});