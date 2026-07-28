"use client";

import Link from "next/link";
import type { Restaurant } from "@/lib/types";

type MapResultsProps = {
  restaurants: Restaurant[];
};

function topCounts(values: string[], limit = 5) {
  const counts = new Map<string, number>();
  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) {
      continue;
    }
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

export default function MapResults({ restaurants }: MapResultsProps) {
  const boroughs = topCounts(restaurants.map((restaurant) => restaurant.borough));
  const zipcodes = topCounts(
    restaurants
      .map((restaurant) => restaurant.zipcode ?? "")
      .filter(Boolean),
    6
  );
  const zipRestaurants = new Map(
    restaurants
      .filter((restaurant) => restaurant.zipcode)
      .map((restaurant) => [restaurant.zipcode as string, restaurant])
  );
  const strongest = restaurants.slice(0, 4);

  return (
    <section className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-moss">
              Coverage snapshot
            </p>
            <h2 className="mt-1 text-xl font-black text-ink">
              Coverage across boroughs and ZIP codes
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
              Sano is optimized for searchable official records: restaurant name,
              cuisine, borough, address, and ZIP code where DOHMH provides it.
              The snapshot below updates with your current search.
            </p>
          </div>
          <span className="rounded-full bg-oat px-3 py-1.5 text-xs font-black text-ink/65">
            {restaurants.length} loaded results
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-oat p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
              Borough mix
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {boroughs.length ? (
                boroughs.map(([borough, count]) => (
                  <span
                    key={borough}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-sm"
                  >
                    {borough} · {count}
                  </span>
                ))
              ) : (
                <span className="text-sm font-semibold text-ink/50">
                  No boroughs in this result set
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-oat p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
              ZIPs represented
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {zipcodes.length ? (
                zipcodes.map(([zipcode, count]) => {
                  const restaurant = zipRestaurants.get(zipcode);

                  return (
                    <Link
                      key={zipcode}
                      href={restaurant ? `/restaurants/${restaurant.id}` : "#"}
                      aria-label={
                        restaurant
                          ? `Open profile for ${restaurant.name} in ZIP ${zipcode}`
                          : `ZIP ${zipcode}`
                      }
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-sm transition hover:bg-moss hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                    >
                      {zipcode} · {count}
                    </Link>
                  );
                })
              ) : (
                <span className="text-sm font-semibold text-ink/50">
                  ZIP metadata pending for this slice
                </span>
              )}
            </div>
          </div>
        </div>

        {strongest.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {strongest.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
              >
                {restaurant.name}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
