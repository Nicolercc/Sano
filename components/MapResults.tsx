"use client";

import type { Restaurant } from "@/lib/types";

type MapResultsProps = {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelect: (restaurant: Restaurant) => void;
};

export default function MapResults({
  restaurants,
  selectedRestaurant,
  onSelect
}: MapResultsProps) {
  const mapRestaurants = restaurants.length
    ? restaurants
    : selectedRestaurant
      ? [selectedRestaurant]
      : [];
  const lats = mapRestaurants.length
    ? mapRestaurants.map((restaurant) => restaurant.latitude)
    : [40.7128];
  const lngs = mapRestaurants.length
    ? mapRestaurants.map((restaurant) => restaurant.longitude)
    : [-74.006];
  const minLat = Math.min(...lats) - 0.01;
  const maxLat = Math.max(...lats) + 0.01;
  const minLng = Math.min(...lngs) - 0.01;
  const maxLng = Math.max(...lngs) + 0.01;

  function position(restaurant: Restaurant) {
    const x = ((restaurant.longitude - minLng) / (maxLng - minLng || 1)) * 100;
    const y = 100 - ((restaurant.latitude - minLat) / (maxLat - minLat || 1)) * 100;
    return { x, y };
  }

  return (
    <section className="relative overflow-hidden rounded-lg border border-ink/10 bg-[#e7efe8] shadow-sm">
      <div className="absolute left-4 top-3 z-10 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-ink/55 shadow-sm">
        Official record coordinates where available
      </div>

      <div className="relative min-h-[13rem] sm:min-h-[11rem]">
        <svg
          viewBox="0 0 800 190"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <rect width="800" height="190" fill="#e7efe8" />
          <path
            d="M34 158 C126 122 142 58 254 42 C360 26 478 32 620 54 C574 84 560 119 612 154 C490 142 399 152 312 174 C202 171 118 164 34 158Z"
            fill="#f6f2ea"
            stroke="#486b55"
            strokeOpacity="0.22"
            strokeWidth="2"
          />
          <path
            d="M74 150 C155 126 214 99 286 62 C358 25 450 44 556 80 C604 96 654 104 736 95"
            fill="none"
            stroke="#486b55"
            strokeOpacity="0.18"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d="M116 75 L706 132 M188 151 L622 54 M278 39 C316 86 316 123 282 171"
            fill="none"
            stroke="#17201b"
            strokeOpacity="0.07"
            strokeWidth="2"
          />
        </svg>

        {mapRestaurants.map((restaurant) => {
          const { x, y } = position(restaurant);
          const selected = selectedRestaurant?.id === restaurant.id;

          return (
            <button
              key={restaurant.id}
              type="button"
              onClick={() => onSelect(restaurant)}
              className={`absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[11px] font-black shadow-soft transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss ${
                selected
                  ? "border-ink bg-coral text-white"
                  : "border-white bg-moss text-white"
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
              aria-label={`Select ${restaurant.name}`}
              title={restaurant.name}
            >
              {restaurant.grade}
            </button>
          );
        })}
      </div>

      {selectedRestaurant ? (
        <div className="border-t border-ink/10 bg-white px-4 py-3 sm:absolute sm:bottom-3 sm:right-3 sm:z-10 sm:w-[min(24rem,calc(100%-1.5rem))] sm:rounded-lg sm:border sm:bg-white/95 sm:shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">
                {selectedRestaurant.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-ink/60">
                {selectedRestaurant.address}, {selectedRestaurant.borough}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-oat px-2.5 py-1 text-xs font-black text-ink">
              {restaurants.length} {restaurants.length === 1 ? "result" : "results"}
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
