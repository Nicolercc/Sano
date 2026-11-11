import { describe, expect, it } from "vitest";
import { MAX_QUERY_LENGTH, parseRestaurantQuery } from "@/lib/server/query";

const parse = (qs: string) => parseRestaurantQuery(new URLSearchParams(qs));

describe("parseRestaurantQuery", () => {
  it("accepts a normal search", () => {
    expect(parse("q=pizza&trajectory=improving&confidence=high&limit=24&recentCriticalOnly=true")).toEqual({
      ok: true,
      query: {
        q: "pizza",
        cuisine: null,
        trajectory: "improving",
        confidence: "high",
        recentCriticalOnly: true,
        limit: 24
      }
    });
  });

  it("treats missing filters as no filter", () => {
    const result = parse("");
    expect(result.ok && result.query).toMatchObject({ trajectory: null, confidence: null, limit: undefined, recentCriticalOnly: false });
  });

  it.each([
    ["trajectory=sideways", "trajectory"],
    ["confidence=certain", "confidence"],
    ["limit=0", "limit"],
    ["limit=1001", "limit"],
    ["limit=2.5", "limit"],
    ["limit=ten", "limit"],
    [`q=${"x".repeat(MAX_QUERY_LENGTH + 1)}`, "q"]
  ])("rejects %s", (qs, field) => {
    const result = parse(qs);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toContain(field);
  });
});
