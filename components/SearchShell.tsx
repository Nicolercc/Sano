"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import AppNav from "@/components/AppNav";
import FilterBar, { hasActiveFilters } from "@/components/FilterBar";
import MapResults from "@/components/MapResults";
import MarkerGrade from "@/components/MarkerGrade";
import RestaurantCard from "@/components/RestaurantCard";
import TimelineGradeMark from "@/components/TimelineGradeMark";
import { trajectoryLabel } from "@/lib/format";
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
/** Pursuit HQ area — Long Island City / Austell Place */
const PRIMARY_DEMO_QUERY = "11101";

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
  const [heroSearchQuery, setHeroSearchQuery] = useState("");
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
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setLoadError(true);
          setResults([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [filters]);

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
  const featuredRestaurant =
    restaurants.find((restaurant) => restaurant.id === featuredJourney?.id) ??
    restaurants[0] ??
    null;
  const previewInspections = featuredRestaurant
    ? [...featuredRestaurant.inspections]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-5)
    : [];
  const maxPreviewInspectionScore = Math.max(
    ...previewInspections.map((inspection) => inspection.score),
    1
  );

  const clearFilters = () => {
    setFilters(defaultFilters);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  const runHeroSearch = (query: string) => {
    const nextQuery = query.trim() || PRIMARY_DEMO_QUERY;
    setHeroSearchQuery(nextQuery);
    setFilters({ ...defaultFilters, query: nextQuery });
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    window.requestAnimationFrame(() => {
      searchSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  };

  const runPrimaryDemoSearch = () => runHeroSearch(PRIMARY_DEMO_QUERY);

  return (
    <main className="min-h-screen overflow-x-hidden bg-oat text-ink">
      <AppNav active="home" onCommandSearch={runHeroSearch} />
      <div
        className="relative isolate overflow-hidden bg-[#1e2a38] text-white"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 16%, rgba(37,99,201,0.22), transparent 28%), radial-gradient(circle at 82% 12%, rgba(111,163,224,0.15), transparent 25%), linear-gradient(135deg, #1e2a38 0%, #2c3e50 100%)"
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-100"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,168,190,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(148,168,190,0.09) 1px, transparent 1px)",
            backgroundSize: "52px 52px"
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-8 top-32 -z-10 h-32 w-32 rotate-[-16deg] opacity-70"
          aria-hidden="true"
        >
          <span className="absolute left-0 top-6 h-24 w-3 rounded-full bg-[rgba(148,168,190,0.1)]" />
          <span className="absolute left-6 top-0 h-32 w-3 rounded-full bg-[rgba(148,168,190,0.09)]" />
          <span className="absolute left-16 top-2 h-28 w-8 rounded-full border-[10px] border-[rgba(148,168,190,0.1)]" />
        </div>
        <div
          className="pointer-events-none absolute right-16 top-24 -z-10 h-44 w-44 rounded-full border-[22px] border-[rgba(148,168,190,0.1)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-[-11rem] left-1/2 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-[#2563c9]/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(24rem,0.98fr)] lg:px-8 lg:pb-20 lg:pt-16">
          <header id="landing" className="min-w-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6fa3e0]/25 bg-[#2563c9]/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#9dc0ec] shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#6fa3e0]" aria-hidden="true" />
              Built on NYC DOHMH public inspection records
            </div>
            <h1 className="mx-auto mt-7 max-w-5xl text-[3rem] font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-6xl lg:mx-0 lg:text-7xl">
              The grade is on the door.{" "}
              <span className="block">The story isn’t.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/70 sm:text-xl sm:leading-9 lg:mx-0">
              Sano turns NYC public restaurant inspection records into clear
              patterns: recent flags, repeat issues, history depth, and how the
              current grade got there.
            </p>

            <form
              className="mx-auto mt-9 flex max-w-3xl flex-col gap-3 rounded-[1.45rem] border border-white/10 bg-white/10 p-2 shadow-[0_30px_90px_rgba(7,13,22,0.25)] backdrop-blur sm:flex-row lg:mx-0"
              onSubmit={(event) => {
                event.preventDefault();
                runHeroSearch(heroSearchQuery);
              }}
            >
              <label className="min-w-0 flex-1">
                <span className="sr-only">
                  Search by restaurant, ZIP, cuisine, or borough
                </span>
                <input
                  value={heroSearchQuery}
                  onChange={(event) => setHeroSearchQuery(event.target.value)}
                  placeholder="Search by restaurant, ZIP, cuisine, or borough"
                  className="min-h-14 w-full rounded-[1.05rem] border border-white/10 bg-white/10 px-5 text-base font-semibold text-white outline-none placeholder:text-white/40 focus:border-[#6fa3e0] focus:ring-4 focus:ring-[#2563c9]/25"
                />
              </label>
              <button
                type="submit"
                className="inline-flex min-h-14 items-center justify-center rounded-[1.05rem] bg-[#2563c9] px-7 text-base font-black text-white shadow-[0_18px_40px_rgba(37,99,201,0.32)] transition hover:-translate-y-0.5 hover:bg-[#1e56ad] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa3e0]"
              >
                Search
              </button>
            </form>

            <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-sm lg:mx-0 lg:justify-start">
              <span className="font-bold text-white/50">Try:</span>
              {["11101", "Long Island City", "Thai", featuredRestaurant?.name ?? "Lucky Chix"].map(
                (example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => runHeroSearch(example)}
                    className="rounded-full border border-[#6fa3e0]/25 bg-[#2563c9]/12 px-3 py-1.5 font-bold text-[#9dc0ec] transition hover:border-[#6fa3e0]/50 hover:bg-[#2563c9]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa3e0]"
                  >
                    {example}
                  </button>
                )
              )}
            </div>

            <dl className="mx-auto mt-9 grid max-w-3xl grid-cols-2 gap-3 text-left sm:grid-cols-4 lg:mx-0">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                  Restaurants
                </dt>
                <dd className="mt-2 text-2xl font-black text-white">
                  {dataSummary.restaurantCount.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                  Inspections
                </dt>
                <dd className="mt-2 text-2xl font-black text-white">
                  {dataSummary.inspectionCount.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                  Source
                </dt>
                <dd className="mt-2 text-sm font-black leading-6 text-white">
                  NYC DOHMH
                </dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                  Extract
                </dt>
                <dd className="mt-2 text-sm font-black leading-6 text-white">
                  {dataAsOfLabel ?? "Published extract"}
                </dd>
              </div>
            </dl>

            <p className="mx-auto mt-5 max-w-3xl text-sm font-semibold leading-6 text-white/52 lg:mx-0">
              Sano is not a safety verdict or official NYC rating — it is
              context from public inspection history.
            </p>
          </header>

          <section
            aria-label="Sano product preview"
            className="relative min-w-0 rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-[0_30px_100px_rgba(7,13,22,0.32)] backdrop-blur-xl sm:p-5"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#2563c9]/25 blur-2xl" />
            <div
              className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-[var(--surface-2)] p-4 text-[var(--text-primary)] shadow-soft"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(80,140,220,0.12) 1px, transparent 1px)",
                backgroundSize: "100% 28px"
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563c9]">
                    Product preview
                  </p>
                  <p className="mt-1 font-serif text-2xl font-black leading-tight">
                    {featuredRestaurant?.name ?? "A real NYC restaurant"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">
                    {featuredRestaurant?.cuisine ?? "NYC restaurant"} ·{" "}
                    {featuredRestaurant?.neighborhood ?? "official record"}
                  </p>
                </div>
                <MarkerGrade grade={featuredRestaurant?.grade ?? "A"} size="xl" />
              </div>

              <div className="mt-6 rounded-2xl border border-ink/10 bg-white/104 p-4">
                <div className="mb-4 flex flex-col items-start gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                      Inspection timeline
                    </p>
                    <p className="mt-1 text-sm font-black text-[var(--text-primary)]">
                      {featuredRestaurant?.sanoLabel ?? "Public record context"}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-[#2563c9]/10 px-3 py-1 text-xs font-black text-[#2563c9]">
                    Official grade
                  </span>
                </div>
                <div className="grid h-44 items-end gap-2 sm:grid-cols-5">
                  {(previewInspections.length
                    ? previewInspections
                    : [
                        { id: "preview-1", score: 12, grade: "A", criticalCount: 0 },
                        { id: "preview-2", score: 24, grade: "B", criticalCount: 1 },
                        { id: "preview-3", score: 9, grade: "A", criticalCount: 0 },
                        { id: "preview-4", score: 31, grade: "C", criticalCount: 2 },
                        { id: "preview-5", score: 13, grade: "A", criticalCount: 1 }
                      ]).map((inspection) => (
                    <div
                      key={inspection.id}
                      className="relative flex h-full items-end rounded-xl bg-[#2563c9]/8 p-2 pt-7"
                    >
                      <div
                        className="relative w-full rounded-lg bg-[#2563c9] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                        style={{
                          height: `${Math.max(
                            12,
                            (inspection.score / maxPreviewInspectionScore) * 100
                          )}%`
                        }}
                      >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2">
                          <TimelineGradeMark
                            grade={inspection.grade}
                            rotation={inspection.grade === "A" ? 1 : -2}
                          />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-[#1e2a38] p-3 text-white">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                      Inspection reliability
                    </p>
                    <p className="mt-1 text-2xl font-black">
                      {featuredRestaurant?.inspectionReliabilityScore ?? "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
                      Trend
                    </p>
                    <p className="mt-1 text-lg font-black text-[#7fd88f]">
                      {trajectoryLabel(featuredRestaurant?.trajectory ?? "stable")}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-4 rounded-2xl border border-ink/10 bg-white/70 p-3 text-xs font-semibold leading-5 text-[var(--text-secondary)]">
                Data disclosure: public rating metadata appears only when
                matched. Missing reviews stay blank; Sano does not invent them.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["Manhattan", "Queens", "Brooklyn"].map((borough) => (
                <div
                  key={borough}
                  className="rounded-2xl border border-white/10 bg-white/10 p-3 text-center shadow-sm backdrop-blur"
                >
                  <p className="text-xs font-black text-white">{borough}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-white/40">
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
          aria-labelledby="signal-bridge-heading"
          className="-mt-8 rounded-[2rem] border border-white/80 bg-white/92 p-5 shadow-[0_24px_90px_rgba(23,32,27,0.11)] backdrop-blur sm:p-6 lg:p-8"
        >
          <div className="flex flex-col gap-6">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2563c9]">
                Public records, readable context
              </p>
              <h2
                id="signal-bridge-heading"
                className="mt-3 max-w-4xl text-3xl font-black leading-[1.04] tracking-[-0.02em] text-ink sm:text-4xl lg:text-5xl"
              >
                <span className="block">Keep the grade. </span>
                <span className="block">Read the pattern. </span>
                <span className="block">Know the limits.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/64">
                Sano keeps official NYC inspection records visible, then
                summarizes what those records can and cannot tell you.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              [
                "01",
                "Official records stay first",
                "Grades, dates, scores, and violations come from NYC DOHMH public inspection records."
              ],
              [
                "02",
                "Signals explain the pattern",
                "Sano summarizes trajectory, recent critical flags, repeat issues, and history depth."
              ],
              [
                "03",
                "Limitations stay visible",
                "The app is not a safety verdict, live city rating, or official endorsement."
              ]
            ].map(([step, title, body]) => (
              <article
                key={step}
                className="rounded-[1.35rem] border border-ink/10 bg-[#fbf8f1] p-5 shadow-sm"
              >
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563c9]">
                  {step}
                </p>
                <h3 className="mt-5 text-lg font-black leading-tight text-ink">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-ink/60">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          aria-labelledby="how-it-works-heading"
          className="scroll-mt-24 rounded-[2rem] border border-ink/10 bg-white/90 p-5 shadow-sm sm:p-6 lg:p-8"
        >
          <div className="mb-6 flex max-w-3xl flex-col gap-3">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2563c9]">
                How it works
              </p>
              <h2
                id="how-it-works-heading"
                className="mt-2 text-3xl font-black leading-tight tracking-[-0.015em] text-ink sm:text-4xl"
              >
                Three steps, no invented certainty.
              </h2>
            </div>
            <p className="max-w-2xl text-sm font-semibold leading-6 text-ink/55">
              Sano translates records into context while keeping source limits
              visible.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              [
                "01",
                "Start with official records",
                "Start with NYC DOHMH inspection data — restaurant identity, grade, inspection dates, scores, and violation context.",
              ],
              [
                "02",
                "Read the pattern",
                "Read trajectory, recent critical flags, repeat patterns, and history depth instead of treating one letter as the whole story.",
              ],
              [
                "03",
                "Know the limits",
                "Ratings only appear when matched. Sano does not invent reviews, official endorsement, or safety certainty.",
              ]
            ].map(([step, title, body]) => (
              <article
                key={step}
                className="rounded-[1.35rem] border border-ink/10 bg-oat p-5 transition hover:border-[#2563c9]/25"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2563c9] text-xs font-black text-white">
                    {step}
                  </span>
                  <div className="h-px flex-1 bg-ink/10" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-black text-[var(--text-primary)]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {demoJourneys.length > 0 ? (
          <section
            id="demo"
            aria-labelledby="demo-journeys-heading"
            className="min-w-0 scroll-mt-24 rounded-[2rem] border border-ink/10 bg-white/90 p-5 shadow-sm sm:p-6 lg:p-8"
          >
            <div className="mb-5 flex max-w-3xl flex-col gap-3">
              <div className="max-w-2xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2563c9]">
                  Demo paths
                </p>
              <h2
                id="demo-journeys-heading"
                  className="mt-2 text-3xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-4xl"
              >
                  Choose the story you want to show.
              </h2>
              <p className="mt-1 text-sm leading-6 text-ink/60">
                Real restaurant profiles from the current index — useful demo
                paths, not invented ratings.
              </p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 md:grid-cols-3">
              {demoJourneys.map((restaurant) => {
                const copy = journeyCardCopy(restaurant);

                return (
                  <Link
                    key={restaurant.id}
                    href={`/restaurants/${restaurant.id}`}
                    className="group min-w-0 rounded-[1.35rem] border border-ink/10 bg-oat p-5 shadow-sm transition hover:border-[#2563c9]/30 hover:bg-[#fbf8f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6fa3e0]"
                  >
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#2563c9]">
                      {copy.eyebrow}
                    </p>
                    <p className="mt-3 text-xl font-black leading-snug text-ink">
                      {copy.title}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-ink/55">
                      {restaurant.name}
                      <span className="text-ink/30"> · </span>
                      Official grade {restaurant.grade}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-ink/65">
                      {copy.body}
                    </p>
                    <p className="mt-5 text-sm font-black text-ink transition group-hover:text-[#2563c9]">
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
          className="flex min-w-0 scroll-mt-24 flex-col gap-4 rounded-[2rem] border border-ink/10 bg-white/90 p-5 shadow-sm sm:p-6 lg:p-8"
        >
          <div className="flex max-w-3xl flex-col gap-3">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#2563c9]">
                Search app
              </p>
              <h2
                id="search-heading"
                className="mt-2 text-3xl font-black leading-tight tracking-[-0.03em] text-ink sm:text-4xl"
              >
                Explore the current NYC inspection index.
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                Filter by name, cuisine, borough, ZIP, trajectory, or
                confidence. Coverage is growing and is not citywide yet.
              </p>
            </div>
            <span className="w-fit rounded-full bg-oat px-4 py-2 text-sm font-black text-ink/60">
              {dataSummary.restaurantCount.toLocaleString()} records indexed
            </span>
          </div>

          <FilterBar
            filters={filters}
            cuisines={cuisines}
            resultCount={results.length}
            onChange={setFilters}
            onClear={clearFilters}
          />

          <MapResults restaurants={results} />

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
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
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
