import { NextResponse } from "next/server";
import { getRestaurantDataSummary } from "@/lib/server/restaurants";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      app: "sano",
      data: getRestaurantDataSummary()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
