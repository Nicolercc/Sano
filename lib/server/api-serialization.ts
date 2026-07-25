import { getRestaurantDataMode } from "@/lib/server/restaurants";
import type { MetadataAvailability, Restaurant } from "@/lib/types";

export type PublicRestaurant = Omit<
  Restaurant,
  "rating" | "reviewCount" | "priceLevel" | "trustGap"
> & {
  rating: number | null;
  reviewCount: number | null;
  priceLevel: Restaurant["priceLevel"] | null;
  trustGap: number | null;
  metadataAvailability: MetadataAvailability;
};

function officialModeMetadataAvailability(): MetadataAvailability {
  return {
    popularity: false,
    price: false,
    trustGap: false
  };
}

function syntheticModeMetadataAvailability(): MetadataAvailability {
  return {
    popularity: true,
    price: true,
    trustGap: true
  };
}

function officialDerivedMetadataAvailability(
  restaurant: Restaurant
): MetadataAvailability {
  const declared = restaurant.metadataAvailability;
  const hasPopularity =
    declared?.popularity ??
    Boolean(
      restaurant.placeMetadata &&
        Number(restaurant.rating) > 0 &&
        Number(restaurant.reviewCount) > 0
    );
  const hasPrice =
    declared?.price ?? Boolean(restaurant.placeMetadata?.priceLevel);
  const hasTrustGap =
    declared?.trustGap ??
    (typeof restaurant.trustGap === "number" && restaurant.trustGap !== 0);

  return {
    popularity: hasPopularity,
    price: hasPrice,
    trustGap: hasTrustGap
  };
}

export function serializeRestaurantForApi(
  restaurant: Restaurant
): PublicRestaurant {
  if (getRestaurantDataMode() !== "synthetic-demo-seed") {
    const availability = officialDerivedMetadataAvailability(restaurant);

    return {
      ...restaurant,
      rating: availability.popularity ? restaurant.rating : null,
      reviewCount: availability.popularity ? restaurant.reviewCount : null,
      priceLevel: availability.price ? restaurant.priceLevel : null,
      trustGap: availability.trustGap ? restaurant.trustGap : null,
      metadataAvailability: availability
    };
  }

  return {
    ...restaurant,
    metadataAvailability: syntheticModeMetadataAvailability()
  };
}

export function serializeRestaurantsForApi(restaurants: Restaurant[]) {
  return restaurants.map(serializeRestaurantForApi);
}
