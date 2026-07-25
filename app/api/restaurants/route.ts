import { NextRequest, NextResponse } from "next/server";
import { serializeRestaurantsForApi } from "@/lib/server/api-serialization";
import { listRestaurantsForApp } from "@/lib/server/restaurants";

function booleanParam(value: string | null) {
  return value === "true" || value === "1";
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const requestedLimit = Number(params.get("limit"));

  const restaurants = await listRestaurantsForApp({
    q: params.get("q"),
    cuisine: params.get("cuisine"),
    trajectory: params.get("trajectory") as never,
    confidence: params.get("confidence") as never,
    recentCriticalOnly: booleanParam(params.get("recentCriticalOnly")),
    limit: Number.isFinite(requestedLimit) ? requestedLimit : undefined
  });

  return NextResponse.json({
    count: restaurants.length,
    restaurants: serializeRestaurantsForApi(restaurants)
  });
}
