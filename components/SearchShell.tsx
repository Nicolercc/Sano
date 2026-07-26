"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FilterBar, { hasActiveFilters } from "@/components/FilterBar";
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

function activeFilterSummary(filters: RestaurantFilters) {
  const parts: string[] = [];

  if (filters.query.trim()) {
    parts.push(`“${filters.query.trim()}”`);
  }
  if (filters.cuisine !== "all") {
    parts.push(filters.cuisine);
  }
  if (filters.trajectory !== "all") {
    parts.push(`${filters.trajectory} trajectory`);
  }
  if (filters.confidence !== "all") {
    parts.push(`${filters.confidence} confidence`);
  }
  if (filters.recentCriticalOnly) {
    parts.push("recent criticals only");
  }

  return parts;
}

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

  const filtersActive = hasActiveFilters(filters);
  const filterParts = activeFilterSummary(filters);

  const clearFilters = () => setFilters(defaultFilters);

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
              A restaurant&apos;s inspection history, with popularity shown only
              when available.
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
          onClear={clearFilters}
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
                Restaurants in this demo extract
              </h1>
              <p className="mt-1 text-sm text-ink/55">
                Inspection history context shown next to available public grade fields.
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
            <div className="rounded-lg border border-ink/10 bg-white p-8 shadow-sm">
              <p className="text-lg font-bold text-ink">
                No restaurants match right now
              </p>
              <p className="mt-2 max-w-lg text-sm leading-6 text-ink/65">
                {filtersActive ? (
                  <>
                    Nothing in this demo set fits your current filters
                    {filterParts.length ? (
                      <>
                        :{" "}
                        <span className="font-semibold text-ink/80">
                          {filterParts.join(" · ")}
                        </span>
                      </>
                    ) : null}
                    . Widen a setting above, or clear filters to see all
                    restaurants in this demo extract again.
                  </>
                ) : (
                  <>
                    No restaurant records are available from the configured demo
                    extract right now. Check the data connection, then try again.
                  </>
                )}
              </p>
              {filtersActive ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex min-h-10 items-center rounded-md border border-ink/15 bg-oat px-4 text-sm font-semibold text-ink shadow-sm transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
