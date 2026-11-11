import type { ConfidenceLevel, Trajectory } from "@/lib/types";
import type { RestaurantQuery } from "@/lib/server/restaurants";

const TRAJECTORIES: ReadonlyArray<Trajectory | "all"> = ["improving", "stable", "declining", "volatile", "all"];
const CONFIDENCE_LEVELS: ReadonlyArray<ConfidenceLevel | "all"> = ["high", "medium", "limited", "all"];

export const MAX_QUERY_LENGTH = 100;
export const MAX_LIMIT = 1000;

export type ParsedRestaurantQuery =
  | { ok: true; query: RestaurantQuery }
  | { ok: false; error: string };

function oneOf<T extends string>(value: string | null, allowed: ReadonlyArray<T>): T | null | undefined {
  if (value === null || value === "") return null;
  return (allowed as ReadonlyArray<string>).includes(value) ? (value as T) : undefined;
}

/** Validates /api/restaurants search params. Unknown enum values are rejected, not ignored. */
export function parseRestaurantQuery(params: URLSearchParams): ParsedRestaurantQuery {
  const q = params.get("q");
  if (q && q.length > MAX_QUERY_LENGTH) {
    return { ok: false, error: `q must be at most ${MAX_QUERY_LENGTH} characters` };
  }

  const trajectory = oneOf(params.get("trajectory"), TRAJECTORIES);
  if (trajectory === undefined) {
    return { ok: false, error: `trajectory must be one of: ${TRAJECTORIES.join(", ")}` };
  }

  const confidence = oneOf(params.get("confidence"), CONFIDENCE_LEVELS);
  if (confidence === undefined) {
    return { ok: false, error: `confidence must be one of: ${CONFIDENCE_LEVELS.join(", ")}` };
  }

  const rawLimit = params.get("limit");
  let limit: number | undefined;
  if (rawLimit !== null && rawLimit !== "") {
    limit = Number(rawLimit);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      return { ok: false, error: `limit must be an integer from 1 to ${MAX_LIMIT}` };
    }
  }

  const recentCritical = params.get("recentCriticalOnly");
  return {
    ok: true,
    query: {
      q,
      cuisine: params.get("cuisine"),
      trajectory,
      confidence,
      recentCriticalOnly: recentCritical === "true" || recentCritical === "1",
      limit
    }
  };
}
