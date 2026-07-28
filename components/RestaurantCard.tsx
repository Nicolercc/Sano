"use client";

import Link from "next/link";
import MarkerGrade from "@/components/MarkerGrade";
import ReviewStars from "@/components/ReviewStars";
import {
  formatCompactInspectionReliabilityScore,
  hasLowInspectionReliabilitySignal,
} from "@/lib/format";
import { scoreMeterTone, scoreTone } from "@/lib/scoring";
import type { Restaurant } from "@/lib/types";

type RestaurantCardProps = {
  restaurant: Restaurant;
};

function locationLine(restaurant: Restaurant) {
  const parts = [
    restaurant.cuisine,
    restaurant.neighborhood,
    restaurant.zipcode?.trim() || null
  ].filter(Boolean);

  return parts.join(" · ");
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const meterWidth = `${Math.max(4, restaurant.inspectionReliabilityScore)}%`;
  const lowInspectionSignal = hasLowInspectionReliabilitySignal(
    restaurant.inspectionReliabilityScore
  );
  const signalSentence =
    restaurant.explanation?.trim() || restaurant.sanoLabel;

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-ink/10 bg-white p-4 shadow-sm transition hover:border-moss/35 sm:p-5">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        <div className="min-w-0 flex-1">
          <h2 className="break-words font-serif text-xl font-bold leading-snug text-ink sm:text-[1.35rem] sm:leading-tight">
            {restaurant.name}
          </h2>
          <p className="mt-1.5 break-words text-sm leading-5 text-ink/60">
            {locationLine(restaurant)}
          </p>
        </div>

        <div className="flex w-full shrink-0 sm:mt-0.5 sm:w-auto">
          <Link
            href={`/restaurants/${restaurant.id}`}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss sm:min-h-10 sm:w-auto"
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
          <MarkerGrade grade={restaurant.grade} size="md" className="mt-2" />
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
          <ReviewStars
            rating={restaurant.rating}
            reviewCount={restaurant.reviewCount}
            metadata={restaurant.placeMetadata}
            className="mt-3"
          />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-ink/70">{signalSentence}</p>
    </article>
  );
}
