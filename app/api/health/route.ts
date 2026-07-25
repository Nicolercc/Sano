import { NextResponse } from "next/server";
import { getRestaurantDataSummaryForApp } from "@/lib/server/restaurants";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      app: "sano",
      data: await getRestaurantDataSummaryForApp()
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
