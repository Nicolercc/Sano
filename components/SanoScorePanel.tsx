import { confidenceTone, scoreTone } from "@/lib/scoring";
import {
  confidenceLabel,
  formatInspectionReliabilityScore,
  formatTrustGap,
  hasPopularityMetadata,
  hasLowInspectionReliabilitySignal,
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
  const lowInspectionSignal = hasLowInspectionReliabilitySignal(
    restaurant.inspectionReliabilityScore
  );

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
            Inspection reliability
          </p>
          <p
            className={`mt-1 font-black leading-none ${
              lowInspectionSignal
                ? "text-3xl text-coral"
                : `text-5xl ${scoreTone(restaurant.inspectionReliabilityScore)}`
            }`}
          >
            {formatInspectionReliabilityScore(
              restaurant.inspectionReliabilityScore
            )}
          </p>
          {lowInspectionSignal ? (
            <p className="mt-2 max-w-xs text-xs font-semibold leading-5 text-ink/55">
              Sano keeps the numeric score in the data, but surfaces this as a
              review state when the inspection pattern is too weak for a reassuring
              consumer summary.
            </p>
          ) : null}
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
            What stands out
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
            Popularity vs. inspection gap
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {hasTrustGap && restaurant.trustGap !== null
              ? formatTrustGap(restaurant.trustGap)
              : "Not matched yet"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-ink/70">{restaurant.explanation}</p>
      <p className="mt-3 text-xs leading-5 text-ink/50">
        Scores summarize public inspection records for comparison. They do not replace
        official grades, current conditions, or professional judgment.
        {!hasTrustGap
          ? hasPopularity
            ? " Trust gap stays pending until popularity metadata is scored against the inspection cohort."
            : " Trust gap stays pending when public rating or review data has not been matched yet."
          : null}
      </p>
    </section>
  );
}
