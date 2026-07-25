import { confidenceTone, scoreTone } from "@/lib/scoring";
import {
  confidenceLabel,
  formatTrustGap,
  hasPopularityMetadata,
  trajectoryLabel
} from "@/lib/format";
import type { Restaurant } from "@/lib/types";

type SanoScorePanelProps = {
  restaurant: Restaurant;
};

export default function SanoScorePanel({ restaurant }: SanoScorePanelProps) {
  const hasPopularity = hasPopularityMetadata(
    restaurant.rating,
    restaurant.reviewCount
  );
  const hasTrustGap =
    typeof restaurant.trustGap === "number" && restaurant.trustGap !== 0;

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
            Inspection Reliability Score
          </p>
          <p
            className={`mt-1 text-5xl font-black leading-none ${scoreTone(
              restaurant.inspectionReliabilityScore
            )}`}
          >
            {restaurant.inspectionReliabilityScore}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${confidenceTone(
            restaurant.confidence
          )}`}
        >
          {confidenceLabel(restaurant.confidence)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md bg-oat p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
            Sano label
          </p>
          <p className="mt-1 text-sm font-bold text-ink">{restaurant.sanoLabel}</p>
        </div>
        <div className="rounded-md bg-oat p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
            Trajectory
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {trajectoryLabel(restaurant.trajectory)}
          </p>
        </div>
        <div className="rounded-md bg-oat p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
            Trust gap
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {hasTrustGap && restaurant.trustGap !== null
              ? formatTrustGap(restaurant.trustGap)
              : "Unavailable"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-ink/70">{restaurant.explanation}</p>
      <p className="mt-3 text-xs leading-5 text-ink/50">
        Scores summarize public inspection records for comparison. They do not replace
        official grades, current conditions, or professional judgment.
        {!hasTrustGap
          ? hasPopularity
            ? " Trust gap is unavailable until popularity metadata is scored against the inspection cohort."
            : " Trust gap is unavailable because the official inspection source does not include public rating or review metadata."
          : null}
      </p>
    </section>
  );
}
