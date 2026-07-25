import { notFound } from "next/navigation";
import RestaurantProfile from "@/components/RestaurantProfile";
import { getRestaurantForApp, restaurants } from "@/lib/server/restaurants";

type RestaurantPageProps = {
  params: {
    id: string;
  };
};

export function generateStaticParams() {
  return restaurants.map((restaurant) => ({ id: restaurant.id }));
}

export const dynamicParams = true;

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const restaurant = await getRestaurantForApp(params.id);

  if (!restaurant) {
    notFound();
  }

  return <RestaurantProfile restaurant={restaurant} />;
}
