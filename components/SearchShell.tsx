"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FilterBar from "@/components/FilterBar";
import MapResults from "@/components/MapResults";
import RestaurantCard from "@/components/RestaurantCard";
import { hasRecentCriticalFlag } from "@/lib/scoring";
import type { Restaurant, RestaurantFilters } from "@/lib/types";

type SearchShellProps = {
  restaurants: Restaurant[];
};

const defaultFilters: RestaurantFilters = {
  query: "",
  cuisine: "all",
  trajectory: "all",
  confidence: "all",
  recentCriticalOnly: false
};

export default function SearchShell({ restaurants }: SearchShellProps) {
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(
    restaurants[0] ?? null
  );

  const cuisines = useMemo(
    () => Array.from(new Set(restaurants.map((restaurant) => restaurant.cuisine))).sort(),
    [restaurants]
  );

  const filteredRestaurants = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const matchesQuery =
        !query ||
        [restaurant.name, restaurant.cuisine, restaurant.neighborhood, restaurant.borough]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesCuisine =
        filters.cuisine === "all" || restaurant.cuisine === filters.cuisine;
      const matchesTrajectory =
        filters.trajectory === "all" ||
        restaurant.trajectory === filters.trajectory;
      const matchesConfidence =
        filters.confidence === "all" ||
        restaurant.confidence === filters.confidence;
      const matchesCritical =
        !filters.recentCriticalOnly || hasRecentCriticalFlag(restaurant);

      return (
        matchesQuery &&
        matchesCuisine &&
        matchesTrajectory &&
        matchesConfidence &&
        matchesCritical
      );
    });
  }, [filters, restaurants]);

  const selectedInResults =
    filteredRestaurants.find((restaurant) => restaurant.id === selectedRestaurant?.id) ??
    filteredRestaurants[0] ??
    null;

  return (
    <main className="min-h-screen bg-oat">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/" className="text-3xl font-black tracking-normal text-ink">
              Sano
            </Link>
            <p className="text-sm text-ink/65">
              Compare restaurants by rating, grade, and inspection-history context.
            </p>
          </div>
          <Link
            href="/methodology"
            className="rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-moss/40"
          >
            Methodology
          </Link>
        </nav>

        <FilterBar filters={filters} cuisines={cuisines} onChange={setFilters} />

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-ink">
                Restaurants near your search
              </h1>
              <span className="text-sm font-semibold text-ink/55">
                {filteredRestaurants.length} matches
              </span>
            </div>

            {filteredRestaurants.length ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    selected={selectedInResults?.id === restaurant.id}
                    onSelect={setSelectedRestaurant}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-ink/10 bg-white p-8 text-center shadow-sm">
                <p className="font-bold text-ink">No restaurants match those filters.</p>
                <p className="mt-2 text-sm text-ink/60">
                  Try a broader cuisine, trajectory, or confidence setting.
                </p>
              </div>
            )}
          </div>

          <MapResults
            restaurants={filteredRestaurants}
            selectedRestaurant={selectedInResults}
            onSelect={setSelectedRestaurant}
          />
        </section>
      </div>
    </main>
  );
}
