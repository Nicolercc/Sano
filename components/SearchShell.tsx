"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import FilterBar, { hasActiveFilters } from "@/components/FilterBar";
import MapResults from "@/components/MapResults";
import RestaurantCard from "@/components/RestaurantCard";
import type { Restaurant, RestaurantFilters } from "@/lib/types";

type SearchShellProps = {
  restaurants: Restaurant[];
  dataSummary: {
    mode: string;
    restaurantCount: number;
    inspectionCount: number;
    dataAsOf: string | null;
  };
};

const defaultFilters: RestaurantFilters = {
  query: "",
  cuisine: "all",
  trajectory: "all",
  confidence: "all",
  recentCriticalOnly: false
};

const INITIAL_VISIBLE_COUNT = 12;
const VISIBLE_INCREMENT = 12;
const API_RESULT_LIMIT = 80;
const PRIMARY_DEMO_QUERY = "11414";

type DemoJourney = {
  id: string;
  name: string;
  grade: string;
  sanoLabel: Restaurant["sanoLabel"];
  trajectory: Restaurant["trajectory"];
  cuisine: string;
  neighborhood: string;
};

const PREFERRED_DEMO_JOURNEY_IDS = ["50169790", "50006959", "50131593"];

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

function toDemoJourney(restaurant: Restaurant): DemoJourney {
  return {
    id: restaurant.id,
    name: restaurant.name,
    grade: restaurant.grade,
    sanoLabel: restaurant.sanoLabel,
    trajectory: restaurant.trajectory,
    cuisine: restaurant.cuisine,
    neighborhood: restaurant.neighborhood
  };
}

function pickDemoJourneys(
  restaurants: Restaurant[],
  mode: string
): DemoJourney[] {
  const byId = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
  const selected: DemoJourney[] = [];
  const used = new Set<string>();
  const useOfficialPaths =
    mode === "supabase-app-records" || mode === "official-generated-seed";

  if (useOfficialPaths) {
    for (const id of PREFERRED_DEMO_JOURNEY_IDS) {
      const live = byId.get(id);
      if (live) {
        selected.push(toDemoJourney(live));
        used.add(id);
      }
    }
  }

  const storyMatchers: Array<(restaurant: Restaurant) => boolean> = [
    (restaurant) =>
      restaurant.sanoLabel === "Volatile history" ||
      restaurant.trajectory === "volatile",
    (restaurant) => restaurant.sanoLabel === "Consistent record",
    (restaurant) =>
      restaurant.sanoLabel === "Recent critical flag" ||
      restaurant.trajectory === "improving"
  ];

  for (const matchesStory of storyMatchers) {
    if (selected.length >= 3) {
      break;
    }

    const match = restaurants.find(
      (restaurant) => !used.has(restaurant.id) && matchesStory(restaurant)
    );
    if (match) {
      selected.push(toDemoJourney(match));
      used.add(match.id);
    }
  }

  for (const restaurant of restaurants) {
    if (selected.length >= 3) {
      break;
    }
    if (!used.has(restaurant.id)) {
      selected.push(toDemoJourney(restaurant));
      used.add(restaurant.id);
    }
  }

  return selected.slice(0, 3);
}

function journeyCardCopy(restaurant: DemoJourney) {
  if (
    restaurant.sanoLabel === "Volatile history" ||
    restaurant.trajectory === "volatile"
  ) {
    return {
      eyebrow: "Compare the pattern",
      title: "Same letter, different history",
      body: `${restaurant.name} currently shows grade ${restaurant.grade}, but the inspection timeline swings. Open the profile to see the record behind the sticker.`
    };
  }

  if (restaurant.sanoLabel === "Consistent record") {
    return {
      eyebrow: "Start with a calm record",
      title: "A steadier inspection path",
      body: `${restaurant.name} is a clear demo of a consistent record — useful when you want to show history without a punitive tone.`
    };
  }

  if (restaurant.sanoLabel === "Recent critical flag") {
    return {
      eyebrow: "Read the recent flag",
      title: "Context before conclusions",
      body: `${restaurant.name} surfaces a recent critical flag beside the current grade. The profile keeps the official record and Sano’s limits visible.`
    };
  }

  if (restaurant.trajectory === "improving") {
    return {
      eyebrow: "Watch the trajectory",
      title: "Improvement shows up over time",
      body: `${restaurant.name} helps show why one grade is not the whole story — the timeline is the point.`
    };
  }

  return {
    eyebrow: "Open a real profile",
    title: "See Sano on a live record",
    body: `${restaurant.name} · ${restaurant.cuisine} in ${restaurant.neighborhood}. Official grade ${restaurant.grade}, with Sano’s derived context underneath.`
  };
}

export default function SearchShell({
  restaurants,
  dataSummary
}: SearchShellProps) {
  const [filters, setFilters] = useState(defaultFilters);
  const [results, setResults] = useState(restaurants);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(
    restaurants[0] ?? null
  );
  const searchSectionRef = useRef<HTMLElement | null>(null);

  const cuisines = useMemo(
    () => Array.from(new Set(restaurants.map((restaurant) => restaurant.cuisine))).sort(),
    [restaurants]
  );

  const demoJourneys = useMemo(
    () => pickDemoJourneys(restaurants, dataSummary.mode),
    [restaurants, dataSummary.mode]
  );

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      limit: String(API_RESULT_LIMIT)
    });

    if (filters.query.trim()) {
      params.set("q", filters.query.trim());
    }
    if (filters.cuisine !== "all") {
      params.set("cuisine", filters.cuisine);
    }
    if (filters.trajectory !== "all") {
      params.set("trajectory", filters.trajectory);
    }
    if (filters.confidence !== "all") {
      params.set("confidence", filters.confidence);
    }
    if (filters.recentCriticalOnly) {
      params.set("recentCriticalOnly", "true");
    }

    setLoading(true);
    setLoadError(false);
    setVisibleCount(INITIAL_VISIBLE_COUNT);

    fetch(`/api/restaurants?${params.toString()}`, {
      headers: { accept: "application/json" },
      signal: controller.signal
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Restaurant search failed: ${response.status}`);
        }
        return response.json();
      })
      .then((payload: { restaurants?: Restaurant[] }) => {
        const nextResults = Array.isArray(payload.restaurants)
          ? payload.restaurants
          : [];
        setResults(nextResults);
        setSelectedRestaurant((current) => {
          if (nextResults.some((restaurant) => restaurant.id === current?.id)) {
            return current;
          }
          return nextResults[0] ?? null;
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setLoadError(true);
          setResults([]);
          setSelectedRestaurant(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [filters]);

  const selectedInResults =
    results.find((restaurant) => restaurant.id === selectedRestaurant?.id) ??
    results[0] ??
    null;

  const filtersActive = hasActiveFilters(filters);
  const filterParts = activeFilterSummary(filters);
  const visibleRestaurants = results.slice(0, visibleCount);
  const hiddenResultCount = Math.max(results.length - visibleRestaurants.length, 0);
  const zipSearchActive = /^\d{5}$/.test(filters.query.trim());
  const dataAsOfLabel = dataSummary.dataAsOf
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(new Date(`${dataSummary.dataAsOf}T12:00:00`))
    : null;

  const clearFilters = () => {
    setFilters(defaultFilters);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const runPrimaryDemoSearch = () => {
    setFilters({ ...defaultFilters, query: PRIMARY_DEMO_QUERY });
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    window.requestAnimationFrame(() => {
      searchSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-oat text-ink">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="font-serif text-3xl font-black tracking-tight text-ink sm:text-4xl"
          >
            Sano
          </Link>
          <Link
            href="/methodology"
            className="inline-flex min-h-10 items-center rounded-md border border-ink/15 bg-white px-4 text-sm font-semibold text-ink shadow-sm transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
          >
            Methodology
          </Link>
        </nav>

        <header className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-moss">
            NYC official inspection data, made readable
          </p>
          <h1 className="mt-3 max-w-4xl font-serif text-[2.1rem] font-black leading-[1.05] tracking-tight text-ink sm:text-5xl sm:leading-[1.05]">
            Every restaurant has a grade. Not every grade tells the same story.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70 sm:text-lg sm:leading-8">
            Sano turns public NYC DOHMH inspection records into a searchable
            discovery layer. Search by restaurant, cuisine, borough, or ZIP —
            popularity appears only when a matched public source exists.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runPrimaryDemoSearch}
              className="inline-flex min-h-11 items-center rounded-md bg-ink px-5 text-sm font-bold text-white shadow-sm transition hover:bg-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              See how it works — search ZIP 11414
            </button>
            <Link
              href="/methodology"
              className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-ink/70 underline-offset-4 transition hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              Or read the methodology
            </Link>
          </div>

          <div className="mt-6 flex min-w-0 flex-col gap-2 border-t border-ink/10 pt-4 text-sm leading-6 text-ink/65 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
            <p className="min-w-0 font-semibold text-ink/80">
              Sourced from NYC DOHMH public inspection records
            </p>
            <span className="hidden text-ink/25 sm:inline" aria-hidden="true">
              ·
            </span>
            <p>
              {dataSummary.restaurantCount.toLocaleString()} restaurants indexed
            </p>
            <span className="hidden text-ink/25 sm:inline" aria-hidden="true">
              ·
            </span>
            <p>
              {dataSummary.inspectionCount.toLocaleString()} inspection cycles
            </p>
            <span className="hidden text-ink/25 sm:inline" aria-hidden="true">
              ·
            </span>
            <p>
              Updated from the city’s published data, not real-time
              {dataAsOfLabel ? ` · as of ${dataAsOfLabel}` : ""}
            </p>
            <span className="hidden text-ink/25 sm:inline" aria-hidden="true">
              ·
            </span>
            <Link
              href="/methodology"
              className="font-semibold text-moss underline-offset-2 hover:underline"
            >
              Methodology
            </Link>
          </div>
        </header>

        {demoJourneys.length > 0 ? (
          <section aria-labelledby="demo-journeys-heading" className="min-w-0">
            <div className="mb-4 max-w-2xl">
              <h2
                id="demo-journeys-heading"
                className="text-xl font-bold text-ink sm:text-2xl"
              >
                Three places to start
              </h2>
              <p className="mt-1 text-sm leading-6 text-ink/60">
                Real restaurant profiles from the current index — useful demo
                paths, not invented ratings.
              </p>
            </div>
            <div className="grid min-w-0 gap-3 md:grid-cols-3">
              {demoJourneys.map((restaurant) => {
                const copy = journeyCardCopy(restaurant);

                return (
                  <Link
                    key={restaurant.id}
                    href={`/restaurants/${restaurant.id}`}
                    className="min-w-0 rounded-xl border border-ink/10 bg-white p-5 shadow-sm transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-moss">
                      {copy.eyebrow}
                    </p>
                    <p className="mt-3 font-serif text-xl font-bold leading-snug text-ink">
                      {copy.title}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-ink/55">
                      {restaurant.name}
                      <span className="text-ink/30"> · </span>
                      Grade {restaurant.grade}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-ink/65">
                      {copy.body}
                    </p>
                    <p className="mt-4 text-sm font-bold text-ink">
                      Open profile →
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <section
          ref={searchSectionRef}
          id="search"
          aria-labelledby="search-heading"
          className="flex min-w-0 scroll-mt-6 flex-col gap-4"
        >
          <div>
            <h2 id="search-heading" className="text-xl font-bold text-ink">
              Search restaurants
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              Filter by name, cuisine, borough, ZIP, trajectory, or confidence.
              Coverage is growing and is not citywide yet.
            </p>
          </div>

          <FilterBar
            filters={filters}
            cuisines={cuisines}
            resultCount={results.length}
            onChange={setFilters}
            onClear={clearFilters}
          />

          <MapResults
            restaurants={results}
            selectedRestaurant={selectedInResults}
            onSelect={setSelectedRestaurant}
          />

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-ink">Search results</h2>
                <p className="mt-1 text-sm text-ink/55">
                  Showing a focused slice first. Narrow with search or filters to
                  explore more of the current index.
                </p>
              </div>
              <span className="text-sm font-semibold text-ink/55">
                {loading ? "Searching…" : `${results.length} shown`}
              </span>
            </div>

            {loadError ? (
              <div className="rounded-lg border border-coral/30 bg-white p-8 shadow-sm">
                <p className="text-lg font-bold text-ink">Search hit a snag</p>
                <p className="mt-2 max-w-lg text-sm leading-6 text-ink/65">
                  That’s on us, not the data. Try again in a moment, or clear
                  filters and retry.
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
            ) : results.length ? (
              <div className="flex flex-col gap-3">
                {visibleRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    selected={selectedInResults?.id === restaurant.id}
                    onSelect={setSelectedRestaurant}
                  />
                ))}
                {hiddenResultCount > 0 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((current) => current + VISIBLE_INCREMENT)
                    }
                    className="mx-auto mt-2 inline-flex min-h-11 items-center rounded-md border border-ink/15 bg-white px-5 text-sm font-bold text-ink shadow-sm transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                  >
                    Show {Math.min(VISIBLE_INCREMENT, hiddenResultCount)} more
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-ink/10 bg-white p-8 shadow-sm">
                <p className="text-lg font-bold text-ink">
                  {filtersActive
                    ? zipSearchActive
                      ? "This area isn’t indexed yet"
                      : "No matches in this record set yet"
                    : "No restaurants available right now"}
                </p>
                <p className="mt-2 max-w-lg text-sm leading-6 text-ink/65">
                  {filtersActive ? (
                    zipSearchActive ? (
                      <>
                        Sano’s coverage is growing but isn’t citywide yet
                        {filterParts.length ? (
                          <>
                            {" "}
                            for{" "}
                            <span className="font-semibold text-ink/80">
                              {filterParts.join(" · ")}
                            </span>
                          </>
                        ) : null}
                        . Try a nearby ZIP or borough, or check{" "}
                        <Link
                          href="/methodology"
                          className="font-semibold text-moss underline-offset-2 hover:underline"
                        >
                          Methodology
                        </Link>{" "}
                        for what’s currently included.
                      </>
                    ) : (
                      <>
                        That combination isn’t in Sano’s current index
                        {filterParts.length ? (
                          <>
                            :{" "}
                            <span className="font-semibold text-ink/80">
                              {filterParts.join(" · ")}
                            </span>
                          </>
                        ) : null}
                        . Try a different ZIP, borough, or cuisine — or broaden
                        your search.
                      </>
                    )
                  ) : (
                    <>
                      No restaurant records are available from the configured
                      index right now. Check the data connection, then try again.
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
          </div>
        </section>

        <footer className="min-w-0 border-t border-ink/10 pt-6 text-sm leading-6 text-ink/60">
          <p className="max-w-3xl">
            Sano is an independent tool built on NYC DOHMH’s public inspection
            dataset. It is not affiliated with or endorsed by the City of New
            York. Grades and history reflect inspections on file — not current,
            real-time safety status.{" "}
            <Link
              href="/methodology"
              className="font-semibold text-moss underline-offset-2 hover:underline"
            >
              Full methodology
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
