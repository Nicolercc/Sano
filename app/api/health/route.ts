import { NextResponse } from "next/server";
import { getRestaurantDataSummary } from "@/lib/server/restaurants";

export function GET() {
  return NextResponse.json({
    status: "ok",
    app: "sano",
    data: getRestaurantDataSummary()
  });
}
