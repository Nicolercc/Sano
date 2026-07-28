import { formatNumber } from "@/lib/format";
import type { PlaceMetadata } from "@/lib/types";

type ReviewStarsProps = {
  rating: number | null | undefined;
  reviewCount: number | null | undefined;
  metadata?: PlaceMetadata;
  variant?: "compact" | "profile";
  className?: string;
};

function hasReviewSignal(
  rating: number | null | undefined,
  reviewCount: number | null | undefined
) {
  return Number(rating) > 0 && Number(reviewCount) > 0;
}

function sourceLabel(metadata?: PlaceMetadata) {
  if (metadata?.provider === "google-places") {
    return "Google Places";
  }

  if (metadata?.provider === "yelp-fusion") {
    return "Yelp";
  }

  return "Public reviews";
}

function matchLabel(metadata?: PlaceMetadata) {
  if (!metadata?.matchConfidence) {
    return "source attached";
  }

  return `${metadata.matchConfidence} match`;
}

function reviewWeight(reviewCount: number) {
  if (reviewCount >= 1000) {
    return { label: "Heavy review signal", width: "100%" };
  }

  if (reviewCount >= 250) {
    return { label: "Established review signal", width: "68%" };
  }

  if (reviewCount >= 75) {
    return { label: "Emerging review signal", width: "42%" };
  }

  return { label: "Light review signal", width: "22%" };
}

function StarGlyph({ fill }: { fill: number }) {
  const fillPercent = `${Math.max(0, Math.min(1, fill)) * 100}%`;

  return (
    <span
      aria-hidden="true"
      className="relative inline-block text-[1.05em] leading-none text-ink/15"
    >
      ★
      <span
        className="absolute inset-0 overflow-hidden text-[#d4af37]"
        style={{ width: fillPercent }}
      >
        ★
      </span>
    </span>
  );
}

export default function ReviewStars({
  rating,
  reviewCount,
  metadata,
  variant = "compact",
  className = ""
}: ReviewStarsProps) {
  const hasSignal = hasReviewSignal(rating, reviewCount);
  const source = sourceLabel(metadata);

  if (!hasSignal) {
    return (
      <div
        className={`rounded-md border border-dashed border-ink/15 bg-white/60 px-3 py-2 ${className}`}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-ink/42">
          Google review context
        </p>
        <p className="mt-1 text-xs font-semibold leading-5 text-ink/50">
          Review source not attached
        </p>
      </div>
    );
  }

  const numericRating = Number(rating);
  const numericReviewCount = Number(reviewCount);
  const fills = Array.from({ length: 5 }, (_, index) =>
    Math.max(0, Math.min(1, numericRating - index))
  );
  const weight = reviewWeight(numericReviewCount);
  const ariaLabel = `${source} rating ${numericRating.toFixed(
    1
  )} out of 5 from ${formatNumber(numericReviewCount)} reviews`;

  if (variant === "profile") {
    return (
      <div
        className={`rounded-lg border border-ink/10 bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] ${className}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-ink/45">
              Google review context
            </p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
              <p className="text-4xl font-black leading-none text-ink">
                {numericRating.toFixed(1)}
              </p>
              <div>
                <div
                  className="flex gap-0.5 text-2xl"
                  role="img"
                  aria-label={ariaLabel}
                >
                  {fills.map((fill, index) => (
                    <StarGlyph key={index} fill={fill} />
                  ))}
                </div>
                <p className="mt-1 text-xs font-bold text-ink/55">
                  {formatNumber(numericReviewCount)} reviews
                </p>
              </div>
            </div>
          </div>

          {metadata?.googleMapsUri ? (
            <a
              href={metadata.googleMapsUri}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center rounded-md border border-ink/15 bg-oat px-3 text-xs font-black text-ink transition hover:border-moss/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
            >
              Open source
            </a>
          ) : null}
        </div>

        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-[#d4af37]"
              style={{ width: weight.width }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-ink/55">
            <span>{weight.label}</span>
            <span>·</span>
            <span>{source}</span>
            <span>·</span>
            <span>{matchLabel(metadata)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <div
          className="flex gap-0.5 text-base"
          role="img"
          aria-label={ariaLabel}
        >
          {fills.map((fill, index) => (
            <StarGlyph key={index} fill={fill} />
          ))}
        </div>
        <span className="text-xs font-black text-ink">
          {numericRating.toFixed(1)}
        </span>
      </div>
      <p className="mt-1 text-[11px] font-semibold leading-4 text-ink/50">
        {source} · {formatNumber(numericReviewCount)} reviews
      </p>
    </div>
  );
}
