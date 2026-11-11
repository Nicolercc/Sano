import { NextRequest, NextResponse } from "next/server";
import { serializeRestaurantForApi } from "@/lib/server/api-serialization";
import { getRestaurantForApp } from "@/lib/server/restaurants";

type RestaurantRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RestaurantRouteContext) {
  const { id } = await params;
  const restaurant = await getRestaurantForApp(id);

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  return NextResponse.json({ restaurant: serializeRestaurantForApi(restaurant) });
}
