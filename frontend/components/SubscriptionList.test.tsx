// frontend/components/SubscriptionList.test.tsx
// Node-environment component render test (no jsdom/DOM needed): asserts the
// subscription list renders expected labels and currency-formatted amounts.
// @vitest-environment node
import { describe, it, expect } from "vitest";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { renderToStaticMarkup } from "react-dom/server";
import { SubscriptionList } from "./SubscriptionList";

describe("SubscriptionList", () => {
  it("renders nothing when there are no subscriptions", () => {
    const html = renderToStaticMarkup(<SubscriptionList subscriptions={[]} />);
    expect(html).toBe("");
  });

  it("renders merchant, formatted amount and cadence", () => {
    const html = renderToStaticMarkup(
      <SubscriptionList
        subscriptions={[
          {
            merchant: "Netflix",
            amount: 12.99,
            cadence: "monthly",
            lastDetected: "2026-08-05",
          },
        ]}
      />
    );
    expect(html).toContain("Netflix");
    expect(html).toContain("$12.99");
    expect(html).toContain("/monthly");
  });
});