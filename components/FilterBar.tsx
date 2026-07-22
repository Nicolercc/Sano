"use client";

import type { ConfidenceLevel, RestaurantFilters, Trajectory } from "@/lib/types";

type FilterBarProps = {
  filters: RestaurantFilters;
  cuisines: string[];
  onChange: (filters: RestaurantFilters) => void;
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

export default function FilterBar({
  filters,
  cuisines,
  onChange
}: FilterBarProps) {
  return (
    <section className="grid gap-3 rounded-lg border border-ink/10 bg-white p-3 shadow-sm md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-ink/55">
        Search
        <input
          value={filters.query}
          onChange={(event) =>
            onChange({ ...filters, query: event.target.value })
          }
          placeholder="Name, cuisine, or neighborhood"
          className="min-h-11 rounded-md border border-ink/10 bg-oat px-3 text-sm font-medium normal-case text-ink outline-none transition focus:border-moss"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-ink/55">
        Cuisine
        <select
          value={filters.cuisine}
          onChange={(event) =>
            onChange({ ...filters, cuisine: event.target.value })
          }
          className="min-h-11 rounded-md border border-ink/10 bg-oat px-3 text-sm font-medium normal-case text-ink outline-none transition focus:border-moss"
        >
          <option value="all">All cuisines</option>
          {cuisines.map((cuisine) => (
            <option key={cuisine} value={cuisine}>
              {cuisine}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-ink/55">
        Trajectory
        <select
          value={filters.trajectory}
          onChange={(event) =>
            onChange({
              ...filters,
              trajectory: event.target.value as RestaurantFilters["trajectory"]
            })
          }
          className="min-h-11 rounded-md border border-ink/10 bg-oat px-3 text-sm font-medium normal-case text-ink outline-none transition focus:border-moss"
        >
          {trajectoryOptions.map((option) => (
            <option key={option} value={option}>
              {label(option)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-ink/55">
        Confidence
        <select
          value={filters.confidence}
          onChange={(event) =>
            onChange({
              ...filters,
              confidence: event.target.value as RestaurantFilters["confidence"]
            })
          }
          className="min-h-11 rounded-md border border-ink/10 bg-oat px-3 text-sm font-medium normal-case text-ink outline-none transition focus:border-moss"
        >
          {confidenceOptions.map((option) => (
            <option key={option} value={option}>
              {label(option)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-h-11 items-center gap-2 rounded-md border border-ink/10 bg-oat px-3 text-sm font-semibold text-ink md:mt-5">
        <input
          type="checkbox"
          checked={filters.recentCriticalOnly}
          onChange={(event) =>
            onChange({ ...filters, recentCriticalOnly: event.target.checked })
          }
          className="h-4 w-4 accent-moss"
        />
        Recent criticals
      </label>
    </section>
  );
}
