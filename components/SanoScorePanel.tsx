import { scoreTone } from "@/lib/scoring";
import {
  formatInspectionReliabilityScore,
  formatPopularityGap,
  hasPopularityMetadata,
  hasLowInspectionReliabilitySignal,
  historyDepthLabel,
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
  const popularityGap = formatPopularityGap(restaurant.trustGap, hasPopularity);
  const gapMatched =
    typeof restaurant.trustGap === "number" && restaurant.trustGap !== 0;
  const lowInspectionSignal = hasLowInspectionReliabilitySignal(
    restaurant.inspectionReliabilityScore
  );
  const inspectionCount = restaurant.inspections.length;

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
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
          <p className="mt-2 max-w-xs text-xs font-semibold leading-5 text-ink/55">
            Summarizes inspection history for comparison — not a live safety
            rating.
            {lowInspectionSignal
              ? " When the pattern is too weak for a reassuring number, Sano shows Needs review instead of a bare low score."
              : null}
          </p>
        </div>
        <div className="rounded-full border border-ink/10 bg-oat px-3 py-1.5 text-left">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
            History depth
          </p>
          <p className="mt-0.5 text-xs font-bold text-ink">
            {historyDepthLabel(restaurant.confidence)}
            <span className="font-semibold text-ink/50">
              {" "}
              · {inspectionCount}{" "}
              {inspectionCount === 1 ? "cycle" : "cycles"}
            </span>
          </p>
        </div>
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
          <p
            className={`mt-1 text-sm font-bold ${
              gapMatched ? "text-ink" : "text-ink/55"
            }`}
          >
            {popularityGap}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-ink/70">{restaurant.explanation}</p>
      <p className="mt-3 text-xs leading-5 text-ink/50">
        Scores summarize public inspection records for comparison. They do not
        replace official grades, current conditions, or professional judgment.
        {!gapMatched
          ? hasPopularity
            ? " Popularity vs. inspection gap stays pending until popularity is scored against the inspection cohort."
            : " Popularity vs. inspection gap stays pending when public rating or review data has not been matched yet."
          : null}
      </p>
    </section>
  );
}
