import RestaurantCard from "@/components/RestaurantCard";
import { getAlternatives } from "@/lib/server/restaurants";
import type { Restaurant } from "@/lib/types";

type AlternativesProps = {
  restaurant: Restaurant;
};

export default function Alternatives({ restaurant }: AlternativesProps) {
  const alternatives = getAlternatives(restaurant);

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
      <div className="grid gap-3 lg:grid-cols-2">
        {alternatives.map((alternative) => (
          <RestaurantCard key={alternative.id} restaurant={alternative} />
        ))}
      </div>
    </section>
  );
}
