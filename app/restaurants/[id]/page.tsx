import { notFound } from "next/navigation";
import RestaurantProfile from "@/components/RestaurantProfile";
import { getRestaurant, restaurants } from "@/lib/server/restaurants";

type RestaurantPageProps = {
  params: {
    id: string;
  };
};

export function generateStaticParams() {
  return restaurants.map((restaurant) => ({ id: restaurant.id }));
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const restaurant = getRestaurant(params.id);

  if (!restaurant) {
    notFound();
  }

  return <RestaurantProfile restaurant={restaurant} restaurants={restaurants} />;
}
