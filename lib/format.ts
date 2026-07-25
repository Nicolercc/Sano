import type { ConfidenceLevel, Trajectory } from "./types";

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

export function hasPopularityMetadata(rating: number, reviewCount: number) {
  return rating > 0 || reviewCount > 0;
}

export function formatPopularitySummary(rating: number, reviewCount: number) {
  if (!hasPopularityMetadata(rating, reviewCount)) {
    return "Public rating unavailable";
  }

  return `${rating.toFixed(1)} rating · ${formatNumber(reviewCount)} reviews`;
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
