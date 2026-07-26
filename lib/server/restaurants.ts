import officialProvenance from "@/data/official-provenance.json";
import officialRestaurants from "@/data/official-restaurants.json";
import placeMetadata from "@/data/place-metadata.json";
import sampleRestaurants from "@/data/sample-restaurants.json";
import { hasRecentCriticalFlag } from "@/lib/scoring";
import type {
  ConfidenceLevel,
  PlaceMetadata,
  Restaurant,
  Trajectory
} from "@/lib/types";

type DataMode =
  | "supabase-app-records"
  | "official-generated-seed"
  | "synthetic-demo-seed";

type RestaurantDataSource = {
  mode: DataMode;
  source: string;
  officialSource: string;
  restaurants: Restaurant[];
  fallbackAvailable: boolean;
  provenance?: typeof officialProvenance;
};

type RestaurantDataSummary = {
  source: string;
  officialSource: string;
  mode: DataMode;
  restaurantCount: number;
  inspectionCount: number;
  dataAsOf: string | null;
  fallbackAvailable: boolean;
  provenance: Record<string, unknown> | null;
};

const DEFAULT_SUPABASE_LIMIT = 500;
const MAX_SUPABASE_LIMIT = 1000;
const gradeOrder = new Map([
  ["A", 0],
  ["B", 1],
  ["C", 2],
  ["N", 3],
  ["NOT YET GRADED", 3],
  ["P", 3],
  ["PENDING", 3],
  ["Z", 4]
]);

const syntheticRestaurants = sampleRestaurants as Restaurant[];
const generatedOfficialRestaurants = officialRestaurants as Restaurant[];
const generatedPlaceMetadata = placeMetadata as PlaceMetadata[];

function withPlaceMetadata(records: Restaurant[]) {
  const metadataByRestaurantId = new Map(
    generatedPlaceMetadata.map((metadata) => [metadata.restaurantId, metadata])
  );

  return records.map((restaurant) => {
    const metadata = metadataByRestaurantId.get(restaurant.id);

    if (!metadata) {
      return restaurant;
    }

    return {
      ...restaurant,
      rating: metadata.rating ?? null,
      reviewCount: metadata.reviewCount ?? null,
      priceLevel: metadata.priceLevel ?? restaurant.priceLevel,
      placeMetadata: metadata,
      sourceNotes: `${restaurant.sourceNotes} Popularity metadata enriched from ${metadata.provider}.`
    };
  });
}

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
      restaurants: withPlaceMetadata(generatedOfficialRestaurants),
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

export function getRestaurantDataMode() {
  return selectedDataSource.mode;
}

export type RestaurantQuery = {
  q?: string | null;
  cuisine?: string | null;
  trajectory?: Trajectory | "all" | null;
  confidence?: ConfidenceLevel | "all" | null;
  recentCriticalOnly?: boolean;
  limit?: number | null;
};

export function listRestaurants(query: RestaurantQuery = {}) {
  const textQuery = query.q?.trim().toLowerCase();

  return restaurants.filter((restaurant) => {
    const matchesQuery =
      !textQuery ||
      [
        restaurant.name,
        restaurant.cuisine,
        restaurant.neighborhood,
        restaurant.borough,
        restaurant.zipcode,
        restaurant.address
      ]
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

function fallbackRestaurantDataSummary(): RestaurantDataSummary {
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

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

function supabaseHeaders(config: { key: string }) {
  return {
    apikey: config.key,
    authorization: `Bearer ${config.key}`
  };
}

function boundedLimit(value?: number | null) {
  if (!value || !Number.isFinite(value)) {
    return DEFAULT_SUPABASE_LIMIT;
  }

  return Math.min(Math.max(Math.floor(value), 1), MAX_SUPABASE_LIMIT);
}

function escapeSupabaseValue(value: string) {
  return value.replace(/"/g, '\\"').replace(/\*/g, "\\*");
}

function gradeRank(grade: string | null | undefined) {
  return gradeOrder.get(String(grade ?? "").toUpperCase()) ?? 5;
}

function compareRestaurantsForDefaultView(a: Restaurant, b: Restaurant) {
  return (
    gradeRank(a.grade) - gradeRank(b.grade) ||
    b.inspectionReliabilityScore - a.inspectionReliabilityScore ||
    b.dataAsOf.localeCompare(a.dataAsOf) ||
    a.name.localeCompare(b.name)
  );
}

function sortRestaurantsForDefaultView(records: Restaurant[]) {
  return [...records].sort(compareRestaurantsForDefaultView);
}

function buildSupabaseRestaurantUrl(
  config: { url: string },
  query: RestaurantQuery = {}
) {
  const params = new URLSearchParams({
    select: "payload",
    order: "grade.asc.nullslast,inspection_reliability_score.desc,name.asc",
    limit: String(boundedLimit(query.limit))
  });

  const textQuery = query.q?.trim();
  if (textQuery) {
    const escaped = escapeSupabaseValue(textQuery);
    params.set(
      "or",
      `(name.ilike.*${escaped}*,cuisine.ilike.*${escaped}*,neighborhood.ilike.*${escaped}*,borough.ilike.*${escaped}*,search_text.ilike.*${escaped}*)`
    );
  }

  if (query.cuisine && query.cuisine !== "all") {
    params.set("cuisine", `eq.${query.cuisine}`);
  }
  if (query.trajectory && query.trajectory !== "all") {
    params.set("trajectory", `eq.${query.trajectory}`);
  }
  if (query.confidence && query.confidence !== "all") {
    params.set("confidence", `eq.${query.confidence}`);
  }
  if (query.recentCriticalOnly) {
    params.set("recent_critical", "eq.true");
  }

  return `${config.url}/rest/v1/restaurant_records?${params.toString()}`;
}

function hasScopedRestaurantQuery(query: RestaurantQuery = {}) {
  return Boolean(
    query.q?.trim() ||
      (query.cuisine && query.cuisine !== "all") ||
      (query.trajectory && query.trajectory !== "all") ||
      (query.confidence && query.confidence !== "all") ||
      query.recentCriticalOnly
  );
}

async function fetchSupabaseRestaurants(query: RestaurantQuery = {}) {
  const config = supabaseConfig();
  if (!config) {
    return null;
  }

  try {
    const response = await fetch(buildSupabaseRestaurantUrl(config, query), {
      headers: supabaseHeaders(config),
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const rows = (await response.json()) as Array<{ payload: Restaurant }>;
    const records = rows.map((row) => row.payload).filter(Boolean);
    if (!records.length) {
      return hasScopedRestaurantQuery(query) ? [] : null;
    }

    return isUsableSeed(records) ? sortRestaurantsForDefaultView(records) : null;
  } catch {
    return null;
  }
}

async function fetchSupabaseRestaurant(id: string) {
  const config = supabaseConfig();
  if (!config) {
    return null;
  }

  const params = new URLSearchParams({
    select: "payload",
    id: `eq.${id}`,
    limit: "1"
  });

  try {
    const response = await fetch(
      `${config.url}/rest/v1/restaurant_records?${params.toString()}`,
      {
        headers: supabaseHeaders(config),
        cache: "no-store"
      }
    );

    if (!response.ok) {
      return null;
    }

    const rows = (await response.json()) as Array<{ payload: Restaurant }>;
    return rows[0]?.payload ?? null;
  } catch {
    return null;
  }
}

async function fetchSupabaseSummary(): Promise<RestaurantDataSummary | null> {
  const config = supabaseConfig();
  if (!config) {
    return null;
  }

  const params = new URLSearchParams({
    select: "id,inspection_count,data_as_of",
    limit: "1000"
  });

  try {
    const response = await fetch(
      `${config.url}/rest/v1/restaurant_records?${params.toString()}`,
      {
        headers: {
          ...supabaseHeaders(config),
          Prefer: "count=exact"
        },
        cache: "no-store"
      }
    );

    if (!response.ok) {
      return null;
    }

    const rows = (await response.json()) as Array<{
      inspection_count?: number;
      data_as_of?: string | null;
    }>;
    if (!rows.length) {
      return null;
    }

    const contentRange = response.headers.get("content-range");
    const count = Number(contentRange?.split("/")?.[1]);
    const dataAsOfDates = rows
      .map((row) => row.data_as_of)
      .filter((date): date is string => Boolean(date))
      .sort();

    return {
      source: "Supabase app-ready records generated from NYC DOHMH Restaurant Inspection Results",
      officialSource: "NYC DOHMH Restaurant Inspection Results",
      mode: "supabase-app-records",
      restaurantCount: Number.isFinite(count) ? count : rows.length,
      inspectionCount: rows.reduce(
        (total, row) => total + Number(row.inspection_count ?? 0),
        0
      ),
      dataAsOf: dataAsOfDates[dataAsOfDates.length - 1] ?? null,
      fallbackAvailable: isUsableSeed(restaurants),
      provenance: {
        fallbackMode: selectedDataSource.mode,
        configured: true
      }
    };
  } catch {
    return null;
  }
}

export async function listRestaurantsForApp(query: RestaurantQuery = {}) {
  const supabaseRestaurants = await fetchSupabaseRestaurants(query);
  if (supabaseRestaurants) {
    return supabaseRestaurants;
  }

  return sortRestaurantsForDefaultView(listRestaurants(query));
}

export async function getRestaurantForApp(id: string) {
  return (await fetchSupabaseRestaurant(id)) ?? getRestaurant(id);
}

export async function getAlternativesForApp(restaurant: Restaurant) {
  const supabaseAlternatives = await Promise.all(
    restaurant.alternatives.map((id) => fetchSupabaseRestaurant(id))
  );
  const records = supabaseAlternatives.filter(
    (item): item is Restaurant => Boolean(item)
  );

  return records.length ? records : getAlternatives(restaurant);
}

export function getRestaurantDataSummary() {
  return fallbackRestaurantDataSummary();
}

export async function getRestaurantDataSummaryForApp() {
  return (await fetchSupabaseSummary()) ?? fallbackRestaurantDataSummary();
}
