"use client";

import type { Restaurant } from "@/lib/types";

type MapResultsProps = {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelect: (restaurant: Restaurant) => void;
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

export default function MapResults({
  restaurants,
  selectedRestaurant,
  onSelect
}: MapResultsProps) {
  const boroughs = topCounts(restaurants.map((restaurant) => restaurant.borough));
  const zipcodes = topCounts(
    restaurants
      .map((restaurant) => restaurant.zipcode ?? "")
      .filter(Boolean),
    6
  );
  const strongest = restaurants.slice(0, 4);

  return (
    <section className="grid gap-4 rounded-2xl border border-ink/10 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-moss">
              Coverage snapshot
            </p>
            <h2 className="mt-1 text-xl font-black text-ink">
              Search the real inspection-backed dataset
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/60">
              This is not a fake map. Sano is currently optimized for searchable
              official records: restaurant name, cuisine, borough, address, and
              ZIP code where DOHMH provides it.
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
                zipcodes.map(([zipcode, count]) => (
                  <button
                    key={zipcode}
                    type="button"
                    onClick={() => {
                      const restaurant = restaurants.find(
                        (item) => item.zipcode === zipcode
                      );
                      if (restaurant) {
                        onSelect(restaurant);
                      }
                    }}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-sm transition hover:bg-moss hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
                  >
                    {zipcode} · {count}
                  </button>
                ))
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
              <button
                key={restaurant.id}
                type="button"
                onClick={() => onSelect(restaurant)}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss ${
                  selectedRestaurant?.id === restaurant.id
                    ? "border-ink bg-ink text-white"
                    : "border-ink/10 bg-white text-ink hover:border-moss/40"
                }`}
              >
                {restaurant.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <aside className="rounded-xl border border-ink/10 bg-oat p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
          Selected restaurant
        </p>
        {selectedRestaurant ? (
          <div className="mt-3">
            <p className="text-lg font-black leading-tight text-ink">
              {selectedRestaurant.name}
            </p>
            <p className="mt-2 text-sm leading-5 text-ink/60">
              {selectedRestaurant.address}, {selectedRestaurant.borough}
              {selectedRestaurant.zipcode ? ` ${selectedRestaurant.zipcode}` : ""}
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
                  Grade
                </p>
                <p className="mt-1 font-black text-ink">{selectedRestaurant.grade}</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
                  Score
                </p>
                <p className="mt-1 font-black text-ink">
                  {selectedRestaurant.inspectionReliabilityScore}
                </p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink/45">
                  History
                </p>
                <p className="mt-1 font-black text-ink">
                  {selectedRestaurant.inspections.length}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-ink/60">
            Search by ZIP, restaurant, cuisine, or borough to select a record.
          </p>
        )}
      </aside>
    </section>
  );
}
