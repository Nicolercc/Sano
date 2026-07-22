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
  const mapRestaurants = restaurants.length ? restaurants : selectedRestaurant ? [selectedRestaurant] : [];
  const lats = mapRestaurants.length ? mapRestaurants.map((restaurant) => restaurant.latitude) : [40.7128];
  const lngs = mapRestaurants.length ? mapRestaurants.map((restaurant) => restaurant.longitude) : [-74.006];
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
    <section className="sticky top-4 overflow-hidden rounded-lg border border-ink/10 bg-[#e7efe8] shadow-sm">
      <div className="flex items-center justify-between border-b border-ink/10 bg-white px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-ink">NYC demo geography</h2>
          <p className="text-xs text-ink/60">
            Map-like panel using seed coordinates, no live map dependency.
          </p>
        </div>
        <span className="rounded-full bg-oat px-3 py-1 text-xs font-bold text-ink/70">
          {restaurants.length} results
        </span>
      </div>
      <div className="relative aspect-[4/3] min-h-[320px]">
        <svg
          viewBox="0 0 400 300"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M62 248 C103 197 104 124 153 78 C197 38 245 34 309 53 C285 85 282 126 304 163 C253 169 209 194 176 247 C139 237 103 238 62 248Z"
            fill="#f6f2ea"
            stroke="#486b55"
            strokeOpacity="0.25"
            strokeWidth="2"
          />
          <path
            d="M93 214 C144 197 193 166 257 81"
            fill="none"
            stroke="#486b55"
            strokeOpacity="0.18"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M95 172 L294 109 M117 123 L266 207"
            fill="none"
            stroke="#17201b"
            strokeOpacity="0.08"
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
              className={`absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 text-xs font-black shadow-soft transition hover:scale-105 ${
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
        <div className="border-t border-ink/10 bg-white px-4 py-3">
          <p className="text-sm font-bold text-ink">{selectedRestaurant.name}</p>
          <p className="text-xs text-ink/60">
            {selectedRestaurant.address}, {selectedRestaurant.borough}
          </p>
        </div>
      ) : null}
    </section>
  );
}
