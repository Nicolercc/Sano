import { notFound } from "next/navigation";
import RestaurantProfile from "@/components/RestaurantProfile";
import { restaurants } from "@/lib/mock-data";

type RestaurantPageProps = {
  params: {
    id: string;
  };
};

export function generateStaticParams() {
  return restaurants.map((restaurant) => ({ id: restaurant.id }));
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  const restaurant = restaurants.find((item) => item.id === params.id);

  if (!restaurant) {
    notFound();
  }

  return <RestaurantProfile restaurant={restaurant} restaurants={restaurants} />;
}
