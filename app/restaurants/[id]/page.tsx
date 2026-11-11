import { notFound } from "next/navigation";
import RestaurantProfile from "@/components/RestaurantProfile";
import { getRestaurantForApp, restaurants } from "@/lib/server/restaurants";

type RestaurantPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return restaurants.map((restaurant) => ({ id: restaurant.id }));
}

export const dynamicParams = true;

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { id } = await params;
  const restaurant = await getRestaurantForApp(id);

  if (!restaurant) {
    notFound();
  }

  return <RestaurantProfile restaurant={restaurant} />;
}
