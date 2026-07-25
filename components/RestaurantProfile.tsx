import Link from "next/link";
import Alternatives from "@/components/Alternatives";
import SanoScorePanel from "@/components/SanoScorePanel";
import TrustTimeline from "@/components/TrustTimeline";
import {
  formatDate,
  formatNumber,
  hasPopularityMetadata
} from "@/lib/format";
import type { Restaurant } from "@/lib/types";

type RestaurantProfileProps = {
  restaurant: Restaurant;
};

export default function RestaurantProfile({
  restaurant
}: RestaurantProfileProps) {
  const hasPopularity = hasPopularityMetadata(
    restaurant.rating,
    restaurant.reviewCount
  );
  const ratingLabel =
    hasPopularity && restaurant.rating !== null
      ? restaurant.rating.toFixed(1)
      : "Unavailable";
  const reviewCountLabel =
    hasPopularity && restaurant.reviewCount !== null
      ? formatNumber(restaurant.reviewCount)
      : "Unavailable";

  return (
    <main className="min-h-screen overflow-x-hidden bg-oat">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-normal text-ink">
            Sano
          </Link>
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-md border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-moss/40"
            >
              Search
            </Link>
            <Link
              href="/methodology"
              className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss"
            >
              Methodology
            </Link>
          </div>
        </nav>

        <header className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-moss">
                {restaurant.cuisine} · {restaurant.neighborhood}
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl">
                {restaurant.name}
              </h1>
              <p className="mt-2 text-sm text-ink/65">
                {restaurant.address}, {restaurant.borough}
              </p>
            </div>
            <div className="grid min-w-64 grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-oat p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
                  Public rating
                </p>
                <p className="mt-1 text-lg font-black text-ink">
                  {ratingLabel}
                </p>
              </div>
              <div className="rounded-md bg-oat p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
                  Reviews
                </p>
                <p className="mt-1 text-lg font-black text-ink">
                  {reviewCountLabel}
                </p>
              </div>
              <div className="rounded-md bg-oat p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
                  Grade
                </p>
                <p className="mt-1 text-lg font-black text-ink">{restaurant.grade}</p>
              </div>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-ink/70">
            Sano adds context from inspection history so similar restaurants can be
            compared with more than a single current posted grade.
          </p>
        </header>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="min-w-0 flex flex-col gap-5">
            <SanoScorePanel restaurant={restaurant} />
            <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-ink">Source context</h2>
              <dl className="mt-3 grid gap-3 text-sm">
                <div>
                  <dt className="font-bold text-ink">Data as of</dt>
                  <dd className="text-ink/65">{formatDate(restaurant.dataAsOf)}</dd>
                </div>
                <div>
                  <dt className="font-bold text-ink">Seed note</dt>
                  <dd className="text-ink/65">{restaurant.sourceNotes}</dd>
                </div>
              </dl>
            </section>
          </div>

          <div className="min-w-0 flex flex-col gap-5">
            <TrustTimeline inspections={restaurant.inspections} />
            <Alternatives restaurant={restaurant} />
          </div>
        </div>
      </div>
    </main>
  );
}
