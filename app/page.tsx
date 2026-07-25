import SearchShell from "@/components/SearchShell";
import { listRestaurantsForApp } from "@/lib/server/restaurants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const restaurants = await listRestaurantsForApp();

  return <SearchShell restaurants={restaurants} />;
}
