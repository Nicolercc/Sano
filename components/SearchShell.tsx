"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import AppNav from "@/components/AppNav";
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
  const featuredJourney = demoJourneys[0];

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
      <div className="relative isolate overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(223,243,231,0.95),transparent_28%),radial-gradient(circle_at_85%_8%,rgba(214,157,63,0.22),transparent_24%),linear-gradient(180deg,#fbf7ef_0%,#f6f2ea_72%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-[-10rem] top-24 -z-10 h-80 w-80 rounded-full border border-moss/10 bg-mint/40 blur-3xl"
          aria-hidden="true"
        />
        <div className="pt-3">
          <AppNav active="home" />
        </div>

        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)] lg:px-8 lg:pb-20 lg:pt-16">
          <header id="landing" className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-moss/15 bg-white/70 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-moss shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-moss" aria-hidden="true" />
              NYC official inspection data, made readable
            </div>
            <h1 className="mt-6 max-w-5xl font-serif text-[2.75rem] font-black leading-[0.95] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">
              Every restaurant has a grade. Not every grade tells the same story.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/72 sm:text-xl sm:leading-9">
              Sano is a consumer discovery layer for NYC dining: public DOHMH
              inspection history, translated into clear trajectories, context,
              and honest limitations before you pick a place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={runPrimaryDemoSearch}
                className="group inline-flex min-h-12 items-center rounded-full bg-ink px-6 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
              >
                Explore NYC by ZIP
                <span className="ml-2 transition group-hover:translate-x-0.5" aria-hidden="true">
                  →
                </span>
              </button>
              <Link
                href="/methodology"
                className="inline-flex min-h-12 items-center rounded-full border border-ink/15 bg-white/70 px-5 text-sm font-bold text-ink shadow-sm backdrop-blur transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
              >
                See the methodology
              </Link>
            </div>

            <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur">
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-ink/45">
                  Records
                </dt>
                <dd className="mt-2 text-2xl font-black text-ink">
                  {dataSummary.restaurantCount.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur">
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-ink/45">
                  Inspections
                </dt>
                <dd className="mt-2 text-2xl font-black text-ink">
                  {dataSummary.inspectionCount.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur">
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-ink/45">
                  Source
                </dt>
                <dd className="mt-2 text-sm font-black leading-6 text-ink">
                  NYC DOHMH
                </dd>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/65 p-4 shadow-sm backdrop-blur">
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-ink/45">
                  Freshness
                </dt>
                <dd className="mt-2 text-sm font-black leading-6 text-ink">
                  {dataAsOfLabel ?? "Published extract"}
                </dd>
              </div>
            </dl>
          </header>

          <section
            aria-label="Sano product preview"
            className="relative min-w-0 rounded-[2rem] border border-white/70 bg-[#fffaf1]/80 p-4 shadow-soft backdrop-blur-xl sm:p-5"
          >
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-amber/25 blur-2xl" />
            <div className="rounded-[1.55rem] border border-ink/10 bg-ink p-4 text-white shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mint/70">
                    Live NYC read
                  </p>
                  <p className="mt-1 font-serif text-2xl font-black">
                    Inspection context before the reservation
                  </p>
                </div>
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-mint font-serif text-3xl font-black text-ink">
                  A
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/8 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-white/80">
                    {featuredJourney?.name ?? "A real NYC restaurant"}
                  </p>
                  <span className="rounded-full bg-mint px-3 py-1 text-xs font-black text-moss">
                    Official grade visible
                  </span>
                </div>
                <div className="grid h-44 items-end gap-2 sm:grid-cols-5">
                  {[72, 44, 62, 28, 54].map((height, index) => (
                    <div
                      key={height}
                      className="relative flex h-full items-end rounded-xl bg-white/7 p-2"
                    >
                      <div
                        className={`w-full rounded-lg ${
                          index === 1 || index === 3 ? "bg-coral" : "bg-mint"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-white/45">
                      Signal
                    </p>
                    <p className="mt-1 text-sm font-black">Trajectory</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-white/45">
                      Context
                    </p>
                    <p className="mt-1 text-sm font-black">Critical flags</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-white/45">
                      Honesty
                    </p>
                    <p className="mt-1 text-sm font-black">No fake reviews</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["Manhattan", "Queens", "Brooklyn"].map((borough) => (
                <div
                  key={borough}
                  className="rounded-2xl border border-ink/10 bg-white/70 p-3 text-center shadow-sm"
                >
                  <p className="text-xs font-black text-ink">{borough}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-ink/40">
                    indexed
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <section
          aria-label="How Sano works"
          className="grid gap-3 rounded-[2rem] border border-ink/10 bg-white p-4 shadow-sm md:grid-cols-3 md:p-5"
        >
          {[
            ["01", "Start with official records", "Sano uses NYC DOHMH inspection data as the backbone — not crowd rumors."],
            ["02", "Read the pattern", "The app surfaces trajectory, recent critical flags, repeat patterns, and history depth."],
            ["03", "Know the limits", "Ratings only appear when matched. Sano does not invent reviews or safety certainty."]
          ].map(([step, title, body]) => (
            <div key={step} className="rounded-3xl bg-oat p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-moss">
                {step}
              </p>
              <h2 className="mt-3 text-lg font-black text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/65">{body}</p>
            </div>
          ))}
        </section>

        {demoJourneys.length > 0 ? (
          <section
            id="demo"
            aria-labelledby="demo-journeys-heading"
            className="min-w-0 scroll-mt-24"
          >
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
