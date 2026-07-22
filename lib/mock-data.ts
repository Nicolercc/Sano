import sampleRestaurants from "@/data/sample-restaurants.json";
import type { Restaurant } from "./types";

export const restaurants = sampleRestaurants as Restaurant[];

export function getRestaurantById(id: string) {
  return restaurants.find((restaurant) => restaurant.id === id);
}

export function getAlternatives(restaurant: Restaurant) {
  return restaurant.alternatives
    .map((id) => getRestaurantById(id))
    .filter((item): item is Restaurant => Boolean(item));
}
