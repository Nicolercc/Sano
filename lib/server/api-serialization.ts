import { getRestaurantDataMode } from "@/lib/server/restaurants";
import type { Restaurant } from "@/lib/types";

type MetadataAvailability = {
  popularity: boolean;
  price: boolean;
  trustGap: boolean;
};

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

export function serializeRestaurantForApi(
  restaurant: Restaurant
): PublicRestaurant {
  if (getRestaurantDataMode() === "official-generated-seed") {
    const hasPopularity = Boolean(
      restaurant.placeMetadata &&
        restaurant.rating > 0 &&
        restaurant.reviewCount > 0
    );
    const hasPrice = Boolean(restaurant.placeMetadata?.priceLevel);
    const hasTrustGap = restaurant.trustGap !== 0;

    return {
      ...restaurant,
      rating: hasPopularity ? restaurant.rating : null,
      reviewCount: hasPopularity ? restaurant.reviewCount : null,
      priceLevel: hasPrice ? restaurant.priceLevel : null,
      trustGap: hasTrustGap ? restaurant.trustGap : null,
      metadataAvailability: {
        ...officialModeMetadataAvailability(),
        popularity: hasPopularity,
        price: hasPrice,
        trustGap: hasTrustGap
      }
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
