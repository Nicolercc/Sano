import { describe, expect, it } from "vitest";
import officialRestaurants from "@/data/official-restaurants.json";
import { deriveTrajectory, hasRecentCriticalFlag } from "@/lib/scoring";
import type { Inspection, Restaurant } from "@/lib/types";

const seed = officialRestaurants as unknown as Restaurant[];

const at = (date: string, score: number, criticalCount = 0) =>
  ({ date, score, criticalCount }) as Inspection;

describe("deriveTrajectory", () => {
  it("matches the trajectory the Python scorer stored for every seeded restaurant", () => {
    for (const restaurant of seed) {
      expect(deriveTrajectory(restaurant.inspections), restaurant.name).toBe(restaurant.trajectory);
    }
  });

  it("follows the documented thresholds", () => {
    expect(deriveTrajectory([at("2025-01-01", 40), at("2025-02-01", 0)])).toBe("stable");
    expect(deriveTrajectory([at("2025-01-01", 10), at("2025-02-01", 22), at("2025-03-01", 20)])).toBe("volatile");
    expect(deriveTrajectory([at("2025-01-01", 20), at("2025-02-01", 15), at("2025-03-01", 10)])).toBe("improving");
    expect(deriveTrajectory([at("2025-01-01", 10), at("2025-02-01", 15), at("2025-03-01", 20)])).toBe("declining");
  });

  it("does not depend on input order", () => {
    const ordered = [at("2025-01-01", 20), at("2025-02-01", 15), at("2025-03-01", 10)];
    expect(deriveTrajectory([...ordered].reverse())).toBe(deriveTrajectory(ordered));
  });
});

describe("hasRecentCriticalFlag", () => {
  it("looks only at the two most recent inspections", () => {
    const restaurant = {
      inspections: [at("2025-01-01", 30, 3), at("2025-02-01", 0), at("2025-03-01", 0)]
    } as Restaurant;
    expect(hasRecentCriticalFlag(restaurant)).toBe(false);
    restaurant.inspections[1] = at("2025-02-01", 5, 1);
    expect(hasRecentCriticalFlag(restaurant)).toBe(true);
  });

  it("agrees with the 'Recent critical flag' label in the seed", () => {
    for (const restaurant of seed) {
      if (restaurant.sanoLabel === "Recent critical flag") {
        expect(hasRecentCriticalFlag(restaurant), restaurant.name).toBe(true);
      }
    }
  });
});
