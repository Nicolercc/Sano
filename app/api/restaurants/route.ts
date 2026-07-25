import { NextRequest, NextResponse } from "next/server";
import { listRestaurants } from "@/lib/server/restaurants";

function booleanParam(value: string | null) {
  return value === "true" || value === "1";
}

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const restaurants = listRestaurants({
    q: params.get("q"),
    cuisine: params.get("cuisine"),
    trajectory: params.get("trajectory") as never,
    confidence: params.get("confidence") as never,
    recentCriticalOnly: booleanParam(params.get("recentCriticalOnly"))
  });

  return NextResponse.json({
    count: restaurants.length,
    restaurants
  });
}
