import AppNav from "@/components/AppNav";
import Alternatives from "@/components/Alternatives";
import MarkerGrade from "@/components/MarkerGrade";
import ReviewStars from "@/components/ReviewStars";
import SanoScorePanel from "@/components/SanoScorePanel";
import TrustTimeline from "@/components/TrustTimeline";
import { buildStorySoFar, formatDate } from "@/lib/format";
import type { Restaurant } from "@/lib/types";

type RestaurantProfileProps = {
  restaurant: Restaurant;
};

export default function RestaurantProfile({
  restaurant
}: RestaurantProfileProps) {
  const story = buildStorySoFar(restaurant);

  return (
    <main className="min-h-screen overflow-x-hidden bg-oat">
      <AppNav />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">

        <header className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-wide text-moss">
                {restaurant.cuisine} · {restaurant.neighborhood}
                {restaurant.zipcode ? ` · ${restaurant.zipcode}` : ""}
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-ink sm:text-4xl">
                {restaurant.name}
              </h1>
              <p className="mt-2 text-sm text-ink/65">
                {restaurant.address}, {restaurant.borough}
              </p>
            </div>
          </div>

          <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
            <section
              aria-labelledby="official-inspection-heading"
              className="min-w-0 rounded-lg border border-moss/25 bg-mint/40 p-4"
            >
              <p
                id="official-inspection-heading"
                className="text-[11px] font-black uppercase tracking-[0.16em] text-moss"
              >
                Official inspection data
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
                    Current grade
                  </p>
                  <MarkerGrade grade={restaurant.grade} size="lg" className="mt-2" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
                    Cycles on file
                  </p>
                  <p className="mt-1 text-lg font-black text-ink">
                    {restaurant.inspections.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink/50">
                    Extract as of
                  </p>
                  <p className="mt-1 text-sm font-bold text-ink">
                    {formatDate(restaurant.dataAsOf)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-ink/60">
                Sourced from NYC DOHMH public inspection records. Not real-time.
              </p>
            </section>

            <section
              aria-labelledby="public-popularity-heading"
              className="min-w-0 rounded-lg border border-ink/10 bg-oat p-4"
            >
              <p
                id="public-popularity-heading"
                className="text-[11px] font-black uppercase tracking-[0.16em] text-ink/45"
              >
                Consumer review context
              </p>
              <ReviewStars
                rating={restaurant.rating}
                reviewCount={restaurant.reviewCount}
                metadata={restaurant.placeMetadata}
                variant="profile"
                className="mt-3"
              />
              <p className="mt-3 text-xs leading-5 text-ink/60">
                Google review context is shown only when a reviewed source is
                attached. It is not part of the official NYC grade or Sano
                inspection reliability.
              </p>
            </section>
          </div>
        </header>

        <section
          aria-labelledby="story-so-far-heading"
          className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm"
        >
          <h2
            id="story-so-far-heading"
            className="font-serif text-2xl font-bold text-ink"
          >
            The story so far
          </h2>
          <p className="mt-1 text-sm text-ink/55">
            A plain-language read of this restaurant’s existing Sano fields —
            not a safety verdict.
          </p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-ink/75">
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-5">
            <SanoScorePanel restaurant={restaurant} />
            <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-ink">Source context</h2>
              <dl className="mt-3 grid gap-3 text-sm">
                <div>
                  <dt className="font-bold text-ink">Extract generated</dt>
                  <dd className="text-ink/65">{formatDate(restaurant.dataAsOf)}</dd>
                </div>
                <div>
                  <dt className="font-bold text-ink">Seed note</dt>
                  <dd className="text-ink/65">{restaurant.sourceNotes}</dd>
                </div>
              </dl>
            </section>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <TrustTimeline inspections={restaurant.inspections} />
            <Alternatives restaurant={restaurant} />
          </div>
        </div>
      </div>
    </main>
  );
}
