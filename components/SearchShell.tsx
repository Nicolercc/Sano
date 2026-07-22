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
    <main className="min-h-screen bg-oat text-ink">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <nav className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/"
              className="font-serif text-[2.45rem] font-black leading-none tracking-normal text-ink sm:text-5xl"
            >
              Sano
            </Link>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink/65">
              A restaurant&apos;s inspection history, read alongside its popularity.
            </p>
          </div>
          <Link
            href="/methodology"
            className="inline-flex min-h-10 items-center rounded-md border border-ink/15 bg-white/70 px-4 text-sm font-semibold text-ink shadow-sm transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            Methodology
          </Link>
        </nav>

        <FilterBar
          filters={filters}
          cuisines={cuisines}
          resultCount={filteredRestaurants.length}
          onChange={setFilters}
        />

        <MapResults
          restaurants={filteredRestaurants}
          selectedRestaurant={selectedInResults}
          onSelect={setSelectedRestaurant}
        />

        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-ink">
                Restaurants near your search
              </h1>
              <p className="mt-1 text-sm text-ink/55">
                Inspection history context shown next to public grades and ratings.
              </p>
            </div>
            <span className="text-sm font-semibold text-ink/55">
              {filteredRestaurants.length}{" "}
              {filteredRestaurants.length === 1 ? "match" : "matches"}
            </span>
          </div>

          {filteredRestaurants.length ? (
            <div className="flex flex-col gap-3">
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
        </section>
      </div>
    </main>
  );
}
