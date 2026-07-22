import { confidenceTone, scoreTone } from "@/lib/scoring";
import {
  confidenceLabel,
  formatTrustGap,
  trajectoryLabel
} from "@/lib/format";
import type { Restaurant } from "@/lib/types";

type SanoScorePanelProps = {
  restaurant: Restaurant;
};

export default function SanoScorePanel({ restaurant }: SanoScorePanelProps) {
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
            {formatTrustGap(restaurant.trustGap)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-ink/70">{restaurant.explanation}</p>
      <p className="mt-3 text-xs leading-5 text-ink/50">
        Scores summarize public inspection records for comparison. They do not replace
        official grades, current conditions, or professional judgment.
      </p>
    </section>
  );
}
