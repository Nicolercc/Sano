import officialProvenance from "@/data/official-provenance.json";
import officialRestaurants from "@/data/official-restaurants.json";
import sampleRestaurants from "@/data/sample-restaurants.json";
import { hasRecentCriticalFlag } from "@/lib/scoring";
import type { ConfidenceLevel, Restaurant, Trajectory } from "@/lib/types";

type DataMode = "official-generated-seed" | "synthetic-demo-seed";

type RestaurantDataSource = {
  mode: DataMode;
  source: string;
  officialSource: string;
  restaurants: Restaurant[];
  fallbackAvailable: boolean;
  provenance?: typeof officialProvenance;
};

const syntheticRestaurants = sampleRestaurants as Restaurant[];
const generatedOfficialRestaurants = officialRestaurants as Restaurant[];

function isUsableSeed(records: Restaurant[]) {
  return (
    Array.isArray(records) &&
    records.length > 0 &&
    records.every((restaurant) => restaurant.id && restaurant.name && restaurant.inspections)
  );
}

function selectRestaurantDataSource(): RestaurantDataSource {
  if (isUsableSeed(generatedOfficialRestaurants)) {
    return {
      mode: "official-generated-seed",
      source: "Curated offline extract generated from NYC DOHMH Restaurant Inspection Results",
      officialSource: "NYC DOHMH Restaurant Inspection Results",
      restaurants: generatedOfficialRestaurants,
      fallbackAvailable: isUsableSeed(syntheticRestaurants),
      provenance: officialProvenance
    };
  }

  return {
    mode: "synthetic-demo-seed",
    source: "Synthetic demo seed modeled on NYC DOHMH Restaurant Inspection Results fields",
    officialSource: "NYC DOHMH Restaurant Inspection Results",
    restaurants: syntheticRestaurants,
    fallbackAvailable: false
  };
}

const selectedDataSource = selectRestaurantDataSource();

export const restaurants = selectedDataSource.restaurants;

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

export function getRestaurantById(id: string) {
  return getRestaurant(id) ?? undefined;
}

export function getAlternatives(restaurant: Restaurant) {
  return restaurant.alternatives
    .map((id) => getRestaurantById(id))
    .filter((item): item is Restaurant => Boolean(item));
}

export function getRestaurantDataSummary() {
  const dataAsOfDates = restaurants.map((restaurant) => restaurant.dataAsOf).sort();
  const inspectionCount = restaurants.reduce(
    (total, restaurant) => total + restaurant.inspections.length,
    0
  );

  return {
    source: selectedDataSource.source,
    officialSource: selectedDataSource.officialSource,
    mode: selectedDataSource.mode,
    restaurantCount: restaurants.length,
    inspectionCount,
    dataAsOf: dataAsOfDates[dataAsOfDates.length - 1] ?? null,
    fallbackAvailable: selectedDataSource.fallbackAvailable,
    provenance:
      selectedDataSource.provenance && selectedDataSource.mode === "official-generated-seed"
        ? {
            sourceUrl: selectedDataSource.provenance.upstreamProvenance?.sourceUrl ?? null,
            fetchedAt: selectedDataSource.provenance.upstreamProvenance?.fetchedAt ?? null,
            scoredAt: selectedDataSource.provenance.scoredAt,
            inputRowCount:
              selectedDataSource.provenance.upstreamProvenance?.inputRowCount ?? null,
            normalizedRestaurantCount:
              selectedDataSource.provenance.upstreamProvenance
                ?.normalizedRestaurantCount ?? null
          }
        : null
  };
}
