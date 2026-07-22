"use client";

import Link from "next/link";
import { confidenceTone, scoreTone } from "@/lib/scoring";
import { confidenceLabel, formatNumber } from "@/lib/format";
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
  return (
    <article
      className={`rounded-lg border bg-white p-4 shadow-sm transition ${
        selected ? "border-moss shadow-soft" : "border-ink/10 hover:border-moss/40"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect?.(restaurant)}
        className="block w-full rounded-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        aria-label={`Select ${restaurant.name}`}
        aria-pressed={selected}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-tight text-ink">
              {restaurant.name}
            </h2>
            <p className="mt-1 text-sm text-ink/65">
              {restaurant.cuisine} · {restaurant.neighborhood}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
              Current grade
            </p>
            <p className="mt-0.5 text-xl font-black leading-none text-ink">
              {restaurant.grade}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
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
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Rating
            </p>
            <p className="mt-0.5 text-sm font-bold text-ink">
              {restaurant.rating.toFixed(1)}
              <span className="font-medium text-ink/55">
                {" "}
                · {formatNumber(restaurant.reviewCount)} reviews
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
              Reliability score
            </p>
            <p
              className={`mt-0.5 text-sm font-bold ${scoreTone(
                restaurant.inspectionReliabilityScore
              )}`}
            >
              {restaurant.inspectionReliabilityScore}
            </p>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-ink/70">
          {restaurant.explanation}
        </p>
      </button>

      <Link
        href={`/restaurants/${restaurant.id}`}
        className="mt-4 inline-flex min-h-10 items-center rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
      >
        Open profile
      </Link>
    </article>
  );
}
