import { NextRequest, NextResponse } from "next/server";
import { serializeRestaurantsForApi } from "@/lib/server/api-serialization";
import { parseRestaurantQuery } from "@/lib/server/query";
import { listRestaurantsForApp } from "@/lib/server/restaurants";

export async function GET(request: NextRequest) {
  const parsed = parseRestaurantQuery(request.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const restaurants = await listRestaurantsForApp(parsed.query);

  return NextResponse.json({
    count: restaurants.length,
    restaurants: serializeRestaurantsForApi(restaurants)
  });
}
