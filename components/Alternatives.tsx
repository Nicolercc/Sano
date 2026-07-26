import Link from "next/link";
import {
  formatCompactInspectionReliabilityScore,
  historyDepthLabel,
  trajectoryLabel
} from "@/lib/format";
import { getAlternativesForApp } from "@/lib/server/restaurants";
import type { Restaurant } from "@/lib/types";

type AlternativesProps = {
  restaurant: Restaurant;
};

export default async function Alternatives({ restaurant }: AlternativesProps) {
  const alternatives = await getAlternativesForApp(restaurant);

  if (!alternatives.length) {
    return null;
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <h2 className="text-lg font-bold text-ink">Nearby alternatives</h2>
        <p className="text-sm text-ink/60">
          Compact comparisons from the current index — not endorsements.
        </p>
      </div>
      <ul className="divide-y divide-ink/8">
        {alternatives.map((alternative) => (
          <li
            key={alternative.id}
            className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-base font-bold text-ink">
                {alternative.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-ink/55">
                {alternative.cuisine} · {alternative.neighborhood}
                {alternative.zipcode ? ` ${alternative.zipcode}` : ""}
                <span className="text-ink/30"> · </span>
                Grade {alternative.grade}
                <span className="text-ink/30"> · </span>
                {formatCompactInspectionReliabilityScore(
                  alternative.inspectionReliabilityScore
                )}{" "}
                reliability
                <span className="text-ink/30"> · </span>
                {trajectoryLabel(alternative.trajectory)}
                <span className="text-ink/30"> · </span>
                Depth {historyDepthLabel(alternative.confidence)}
              </p>
            </div>
            <Link
              href={`/restaurants/${alternative.id}`}
              className="inline-flex min-h-9 shrink-0 items-center rounded-md border border-ink/15 bg-oat px-3 text-xs font-bold text-ink transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              Open
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
