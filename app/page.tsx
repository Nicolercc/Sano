import SearchShell from "@/components/SearchShell";
import {
  getRestaurantDataSummaryForApp,
  listRestaurantsForApp
} from "@/lib/server/restaurants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [restaurants, dataSummary] = await Promise.all([
    listRestaurantsForApp({ limit: 48 }),
    getRestaurantDataSummaryForApp()
  ]);

  return <SearchShell restaurants={restaurants} dataSummary={dataSummary} />;
}
