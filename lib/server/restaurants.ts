import sampleRestaurants from "@/data/sample-restaurants.json";
import { hasRecentCriticalFlag } from "@/lib/scoring";
import type { ConfidenceLevel, Restaurant, Trajectory } from "@/lib/types";

const restaurants = sampleRestaurants as Restaurant[];

export type RestaurantQuery = {
  q?: string | null;
  cuisine?: string | null;
  trajectory?: Trajectory | "all" | null;
  confidence?: ConfidenceLevel | "all" | null;
  recentCriticalOnly?: boolean;
};

export function listRestaurants(query: RestaurantQuery = {}) {
  const textQuery = query.q?.trim().toLowerCase();

  return restaurants.filter((restaurant) => {
    const matchesQuery =
      !textQuery ||
      [restaurant.name, restaurant.cuisine, restaurant.neighborhood, restaurant.borough]
        .join(" ")
        .toLowerCase()
        .includes(textQuery);
    const matchesCuisine =
      !query.cuisine || query.cuisine === "all" || restaurant.cuisine === query.cuisine;
    const matchesTrajectory =
      !query.trajectory ||
      query.trajectory === "all" ||
      restaurant.trajectory === query.trajectory;
    const matchesConfidence =
      !query.confidence ||
      query.confidence === "all" ||
      restaurant.confidence === query.confidence;
    const matchesCritical =
      !query.recentCriticalOnly || hasRecentCriticalFlag(restaurant);

    return (
      matchesQuery &&
      matchesCuisine &&
      matchesTrajectory &&
      matchesConfidence &&
      matchesCritical
    );
  });
}

export function getRestaurant(id: string) {
  return restaurants.find((restaurant) => restaurant.id === id) ?? null;
}

export function getRestaurantDataSummary() {
  const dataAsOfDates = restaurants.map((restaurant) => restaurant.dataAsOf).sort();
  const inspectionCount = restaurants.reduce(
    (total, restaurant) => total + restaurant.inspections.length,
    0
  );

  return {
    source: "Synthetic demo seed modeled on NYC DOHMH Restaurant Inspection Results fields",
    officialSource: "NYC DOHMH Restaurant Inspection Results",
    mode: "synthetic-demo-seed",
    restaurantCount: restaurants.length,
    inspectionCount,
    dataAsOf: dataAsOfDates[dataAsOfDates.length - 1] ?? null
  };
}
