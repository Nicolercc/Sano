"use client";

import type { ConfidenceLevel, RestaurantFilters, Trajectory } from "@/lib/types";

type FilterBarProps = {
  filters: RestaurantFilters;
  cuisines: string[];
  resultCount: number;
  onChange: (filters: RestaurantFilters) => void;
  onClear: () => void;
};

const trajectoryOptions: Array<"all" | Trajectory> = [
  "all",
  "improving",
  "stable",
  "volatile",
  "declining"
];

const confidenceOptions: Array<"all" | ConfidenceLevel> = [
  "all",
  "high",
  "medium",
  "limited"
];

function label(value: string) {
  return value === "all"
    ? "All"
    : value.charAt(0).toUpperCase() + value.slice(1);
}

export function hasActiveFilters(filters: RestaurantFilters) {
  return (
    filters.query.trim() !== "" ||
    filters.cuisine !== "all" ||
    filters.trajectory !== "all" ||
    filters.confidence !== "all" ||
    filters.recentCriticalOnly
  );
}

export default function FilterBar({
  filters,
  cuisines,
  resultCount,
  onChange,
  onClear
}: FilterBarProps) {
  const filtersActive = hasActiveFilters(filters);

  return (
    <section className="flex flex-wrap items-center gap-2 rounded-lg border border-ink/10 bg-white/65 p-2.5 shadow-sm backdrop-blur">
      <label className="min-w-0 flex-1 basis-full sm:basis-64">
        <span className="sr-only">Search</span>
        <input
          value={filters.query}
          onChange={(event) =>
            onChange({ ...filters, query: event.target.value })
          }
          placeholder="Name, cuisine, or neighborhood"
          className="min-h-9 w-full rounded-md border border-ink/10 bg-white px-3 text-sm font-medium text-ink outline-none transition placeholder:text-ink/40 focus:border-moss"
        />
      </label>

      <label className="min-w-[9rem] flex-1 sm:flex-none">
        <span className="sr-only">Cuisine</span>
        <select
          value={filters.cuisine}
          onChange={(event) =>
            onChange({ ...filters, cuisine: event.target.value })
          }
          className="min-h-9 w-full rounded-md border border-ink/10 bg-white px-2.5 text-sm font-medium text-ink outline-none transition focus:border-moss"
        >
          <option value="all">All cuisines</option>
          {cuisines.map((cuisine) => (
            <option key={cuisine} value={cuisine}>
              {cuisine}
            </option>
          ))}
        </select>
      </label>

      <label className="min-w-[9rem] flex-1 sm:flex-none">
        <span className="sr-only">Trajectory</span>
        <select
          value={filters.trajectory}
          onChange={(event) =>
            onChange({
              ...filters,
              trajectory: event.target.value as RestaurantFilters["trajectory"]
            })
          }
          className="min-h-9 w-full rounded-md border border-ink/10 bg-white px-2.5 text-sm font-medium text-ink outline-none transition focus:border-moss"
        >
          <option value="all">All trajectories</option>
          {trajectoryOptions
            .filter((option) => option !== "all")
            .map((option) => (
              <option key={option} value={option}>
                {label(option)}
              </option>
            ))}
        </select>
      </label>

      <label className="min-w-[9rem] flex-1 sm:flex-none">
        <span className="sr-only">Confidence</span>
        <select
          value={filters.confidence}
          onChange={(event) =>
            onChange({
              ...filters,
              confidence: event.target.value as RestaurantFilters["confidence"]
            })
          }
          className="min-h-9 w-full rounded-md border border-ink/10 bg-white px-2.5 text-sm font-medium text-ink outline-none transition focus:border-moss"
        >
          <option value="all">All confidence</option>
          {confidenceOptions
            .filter((option) => option !== "all")
            .map((option) => (
              <option key={option} value={option}>
                {label(option)}
              </option>
            ))}
        </select>
      </label>

      <label className="inline-flex min-h-9 flex-1 items-center gap-2 rounded-md border border-ink/10 bg-white px-3 text-sm font-semibold text-ink sm:flex-none">
        <input
          type="checkbox"
          checked={filters.recentCriticalOnly}
          onChange={(event) =>
            onChange({ ...filters, recentCriticalOnly: event.target.checked })
          }
          className="h-4 w-4 shrink-0 accent-moss"
        />
        <span className="whitespace-nowrap">Recent criticals</span>
      </label>

      {filtersActive ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex min-h-9 items-center rounded-md border border-ink/10 bg-white px-3 text-sm font-semibold text-ink/70 transition hover:border-moss/40 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          Clear filters
        </button>
      ) : null}

      <span
        className={`ml-auto hidden whitespace-nowrap px-2 text-xs font-semibold sm:inline ${
          resultCount === 0 && filtersActive ? "text-amber" : "text-ink/50"
        }`}
      >
        {resultCount} {resultCount === 1 ? "match" : "matches"}
      </span>
    </section>
  );
}
