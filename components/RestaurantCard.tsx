"use client";

import Link from "next/link";
import {
  formatCompactInspectionReliabilityScore,
  formatPopularitySummary,
  hasLowInspectionReliabilitySignal,
  hasPopularityMetadata
} from "@/lib/format";
import { scoreMeterTone, scoreTone } from "@/lib/scoring";
import type { Restaurant } from "@/lib/types";

type RestaurantCardProps = {
  restaurant: Restaurant;
  selected?: boolean;
  onSelect?: (restaurant: Restaurant) => void;
};

function locationLine(restaurant: Restaurant) {
  const parts = [
    restaurant.cuisine,
    restaurant.neighborhood,
    restaurant.zipcode?.trim() || null
  ].filter(Boolean);

  return parts.join(" · ");
}

export default function RestaurantCard({
  restaurant,
  selected = false,
  onSelect
}: RestaurantCardProps) {
  const meterWidth = `${Math.max(4, restaurant.inspectionReliabilityScore)}%`;
  const lowInspectionSignal = hasLowInspectionReliabilitySignal(
    restaurant.inspectionReliabilityScore
  );
  const hasPopularity = hasPopularityMetadata(
    restaurant.rating,
    restaurant.reviewCount
  );
  const signalSentence =
    restaurant.explanation?.trim() || restaurant.sanoLabel;
  const popularitySummary = formatPopularitySummary(
    restaurant.rating,
    restaurant.reviewCount
  );

  return (
    <article
      className={`min-w-0 overflow-hidden rounded-xl border p-4 shadow-sm transition sm:p-5 ${
        selected
          ? "border-moss bg-[#fbf8f1] shadow-soft"
          : "border-ink/10 bg-white hover:border-moss/35"
      }`}
    >
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        <div className="min-w-0 flex-1">
          <h2 className="break-words font-serif text-xl font-bold leading-snug text-ink sm:text-[1.35rem] sm:leading-tight">
            {restaurant.name}
          </h2>
          <p className="mt-1.5 break-words text-sm leading-5 text-ink/60">
            {locationLine(restaurant)}
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 sm:mt-0.5 sm:w-auto sm:flex-row">
          {onSelect ? (
            <button
              type="button"
              onClick={() => onSelect(restaurant)}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-ink/15 bg-white px-4 text-sm font-semibold text-ink transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss sm:min-h-10"
              aria-pressed={selected}
            >
              {selected ? "Selected" : "Select"}
            </button>
          ) : null}
          <Link
            href={`/restaurants/${restaurant.id}`}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss sm:min-h-10"
          >
            Open profile
          </Link>
        </div>
      </div>

      <div className="mt-4 grid min-w-0 grid-cols-2 gap-3 border-t border-ink/8 pt-4 sm:max-w-md sm:gap-5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
            Grade
          </p>
          <p className="mt-1 font-serif text-3xl font-bold leading-none text-ink">
            {restaurant.grade}
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
              Reliability
            </p>
            <p
              className={`shrink-0 text-sm font-black tabular-nums ${
                lowInspectionSignal
                  ? "text-coral"
                  : scoreTone(restaurant.inspectionReliabilityScore)
              }`}
            >
              {formatCompactInspectionReliabilityScore(
                restaurant.inspectionReliabilityScore
              )}
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
            <div
              className={`h-full rounded-full ${scoreMeterTone(
                restaurant.inspectionReliabilityScore
              )}`}
              style={{ width: meterWidth }}
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-ink/70">{signalSentence}</p>

      {hasPopularity ? (
        <p className="mt-2 text-sm font-semibold leading-5 text-ink/55">
          {popularitySummary}
        </p>
      ) : (
        <p className="mt-2 text-sm leading-5 text-ink/45">
          {popularitySummary}
        </p>
      )}
    </article>
  );
}
