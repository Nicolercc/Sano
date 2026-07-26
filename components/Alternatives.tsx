import Link from "next/link";
import {
  confidenceLabel,
  formatCompactInspectionReliabilityScore,
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
      <div className="mb-4">
        <h2 className="text-lg font-bold text-ink">Nearby alternatives</h2>
        <p className="text-sm text-ink/60">
          Similar options with stronger inspection trajectory or confidence signals.
        </p>
      </div>
      <div className="grid gap-3">
        {alternatives.map((alternative) => (
          <article
            key={alternative.id}
            className="rounded-xl border border-ink/10 bg-oat p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-serif text-xl font-bold leading-tight text-ink">
                  {alternative.name}
                </h3>
                <p className="mt-1 text-sm leading-5 text-ink/60">
                  {alternative.cuisine} · {alternative.neighborhood}
                  {alternative.zipcode ? ` ${alternative.zipcode}` : ""}
                </p>
              </div>
              <Link
                href={`/restaurants/${alternative.id}`}
                className="inline-flex min-h-9 items-center rounded-md bg-ink px-3 text-xs font-bold text-white transition hover:bg-moss focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
              >
                Open
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-lg bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
                  Grade
                </p>
                <p className="mt-1 font-black text-ink">{alternative.grade}</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
                  Reliability
                </p>
                <p className="mt-1 font-black text-ink">
                  {formatCompactInspectionReliabilityScore(
                    alternative.inspectionReliabilityScore
                  )}
                </p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
                  History
                </p>
                <p className="mt-1 font-black text-ink">
                  {confidenceLabel(alternative.confidence)}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-5 text-ink/65">
              {trajectoryLabel(alternative.trajectory)} inspection trajectory in
              the current extract.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
