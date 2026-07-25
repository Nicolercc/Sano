import { NextRequest, NextResponse } from "next/server";
import { getRestaurant } from "@/lib/server/restaurants";

type RestaurantRouteContext = {
  params: {
    id: string;
  };
};

export function GET(_request: NextRequest, { params }: RestaurantRouteContext) {
  const restaurant = getRestaurant(params.id);

  if (!restaurant) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  return NextResponse.json({ restaurant });
}
