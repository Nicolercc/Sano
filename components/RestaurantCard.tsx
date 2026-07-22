"use client";

import Link from "next/link";
import { confidenceTone, hasRecentCriticalFlag, scoreTone } from "@/lib/scoring";
import { confidenceLabel, formatNumber, trajectoryLabel } from "@/lib/format";
import type { Restaurant } from "@/lib/types";

type RestaurantCardProps = {
  restaurant: Restaurant;
  selected?: boolean;
  onSelect?: (restaurant: Restaurant) => void;
};

export default function RestaurantCard({
  restaurant,
  selected = false,
  onSelect
}: RestaurantCardProps) {
  const recentCritical = hasRecentCriticalFlag(restaurant);

  return (
    <article
      className={`rounded-lg border bg-white p-4 shadow-sm transition ${
        selected ? "border-moss shadow-soft" : "border-ink/10 hover:border-moss/40"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect?.(restaurant)}
        className="block w-full text-left"
        aria-label={`Select ${restaurant.name}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold leading-tight text-ink">
              {restaurant.name}
            </h2>
            <p className="mt-1 text-sm text-ink/65">
              {restaurant.cuisine} · {restaurant.neighborhood}
            </p>
          </div>
          <div className="rounded-md bg-oat px-2 py-1 text-sm font-bold text-ink">
            {restaurant.grade}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Rating
            </p>
            <p className="text-sm font-bold text-ink">
              {restaurant.rating.toFixed(1)}{" "}
              <span className="font-medium text-ink/55">
                ({formatNumber(restaurant.reviewCount)})
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Sano
            </p>
            <p
              className={`text-sm font-bold ${scoreTone(
                restaurant.inspectionReliabilityScore
              )}`}
            >
              {restaurant.inspectionReliabilityScore}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Trend
            </p>
            <p className="text-sm font-bold text-ink">
              {trajectoryLabel(restaurant.trajectory)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-moss">
            {restaurant.sanoLabel}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${confidenceTone(
              restaurant.confidence
            )}`}
          >
            {confidenceLabel(restaurant.confidence)}
          </span>
          {recentCritical ? (
            <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-bold text-coral">
              Recent critical flag
            </span>
          ) : null}
        </div>

        <p className="mt-3 text-sm leading-6 text-ink/70">
          {restaurant.explanation}
        </p>
      </button>

      <Link
        href={`/restaurants/${restaurant.id}`}
        className="mt-4 inline-flex min-h-10 items-center rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-moss"
      >
        Open profile
      </Link>
    </article>
  );
}
