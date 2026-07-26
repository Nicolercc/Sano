import type { ConfidenceLevel, Restaurant, Trajectory } from "./types";

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

export function formatTrustGap(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value}`;
}

export function hasLowInspectionReliabilitySignal(score: number) {
  return score < 15;
}

export function formatInspectionReliabilityScore(score: number) {
  if (hasLowInspectionReliabilitySignal(score)) {
    return "Needs review";
  }

  return String(score);
}

export function formatCompactInspectionReliabilityScore(score: number) {
  if (hasLowInspectionReliabilitySignal(score)) {
    return "Low signal";
  }

  return String(score);
}

export function hasPopularityMetadata(
  rating: number | null | undefined,
  reviewCount: number | null | undefined
) {
  return Number(rating) > 0 && Number(reviewCount) > 0;
}

export function formatPopularitySummary(
  rating: number | null | undefined,
  reviewCount: number | null | undefined
) {
  if (!hasPopularityMetadata(rating, reviewCount)) {
    return "Not matched yet";
  }

  return `${Number(rating).toFixed(1)} rating · ${formatNumber(
    Number(reviewCount)
  )} reviews`;
}

export function trajectoryLabel(trajectory: Trajectory) {
  const labels: Record<Trajectory, string> = {
    improving: "Improving",
    stable: "Stable",
    declining: "Declining",
    volatile: "Volatile"
  };

  return labels[trajectory];
}

export function confidenceLabel(confidence: ConfidenceLevel) {
  const labels: Record<ConfidenceLevel, string> = {
    high: "High confidence",
    medium: "Medium confidence",
    limited: "Limited data"
  };

  return labels[confidence];
}

/** Maps confidence to a consumer-facing history-depth label. */
export function historyDepthLabel(confidence: ConfidenceLevel) {
  const labels: Record<ConfidenceLevel, string> = {
    high: "High",
    medium: "Medium",
    limited: "Limited"
  };

  return labels[confidence];
}

export function formatPopularityGap(
  trustGap: number | null | undefined,
  hasPopularity: boolean
) {
  if (typeof trustGap === "number" && trustGap !== 0) {
    return formatTrustGap(trustGap);
  }

  if (hasPopularity) {
    return "Not scored yet";
  }

  return "Not matched yet";
}

/**
 * Plain-language profile narrative built only from existing restaurant fields.
 */
export function buildStorySoFar(restaurant: Restaurant) {
  const inspectionCount = restaurant.inspections.length;
  const cycleLabel =
    inspectionCount === 1 ? "1 inspection cycle" : `${inspectionCount} inspection cycles`;
  const reliability = formatInspectionReliabilityScore(
    restaurant.inspectionReliabilityScore
  );
  const depth = historyDepthLabel(restaurant.confidence);
  const trajectory = trajectoryLabel(restaurant.trajectory).toLowerCase();
  const hasPopularity = hasPopularityMetadata(
    restaurant.rating,
    restaurant.reviewCount
  );

  const lead = `${restaurant.name} currently posts grade ${restaurant.grade}. Sano reads ${cycleLabel} on file (history depth: ${depth.toLowerCase()}).`;

  const standout = `What stands out: ${restaurant.sanoLabel}. The inspection trajectory reads as ${trajectory}.`;

  const reliabilityLine = hasLowInspectionReliabilitySignal(
    restaurant.inspectionReliabilityScore
  )
    ? `Inspection reliability is marked Needs review — the pattern is too thin or uneven for a reassuring summary number.`
    : `Inspection reliability is ${reliability} on Sano’s 0–100 comparison scale.`;

  const explanation = restaurant.explanation.trim();

  const popularityLine = hasPopularity
    ? `Public popularity metadata is matched (${Number(restaurant.rating).toFixed(
        1
      )} rating · ${formatNumber(Number(restaurant.reviewCount))} reviews). ${
        typeof restaurant.trustGap === "number" && restaurant.trustGap !== 0
          ? `Popularity vs. inspection gap: ${formatTrustGap(restaurant.trustGap)}.`
          : "Popularity vs. inspection gap is not scored yet for this record."
      }`
    : "Public rating and review data are not matched yet — Sano leaves those fields empty instead of inventing them.";

  return {
    paragraphs: [lead, standout, reliabilityLine, explanation, popularityLine].filter(
      Boolean
    ),
    dataAsOf: restaurant.dataAsOf
  };
}
