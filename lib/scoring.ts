import type { Inspection, Restaurant, Trajectory } from "./types";

// The scoring rules themselves live in scripts/score_restaurants.py, which
// computes every derived field stored in the seed. This file only holds the
// two rules the UI applies to an inspection list at render time, and must
// match the Python versions (see lib/scoring.test.ts).

export function hasRecentCriticalFlag(restaurant: Restaurant) {
  const sorted = [...restaurant.inspections].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  return sorted.slice(0, 2).some((inspection) => inspection.criticalCount > 0);
}

export function deriveTrajectory(inspections: Inspection[]): Trajectory {
  if (inspections.length < 3) {
    return "stable";
  }

  const ordered = [...inspections].sort((a, b) => a.date.localeCompare(b.date));
  const scores = ordered.map((inspection) => inspection.score);
  const swings = scores
    .slice(1)
    .map((score, index) => Math.abs(score - scores[index]));

  if (swings.some((swing) => swing >= 12)) {
    return "volatile";
  }

  const firstHalf =
    scores.slice(0, Math.ceil(scores.length / 2)).reduce((a, b) => a + b, 0) /
    Math.ceil(scores.length / 2);
  const secondHalf =
    scores.slice(Math.floor(scores.length / 2)).reduce((a, b) => a + b, 0) /
    (scores.length - Math.floor(scores.length / 2));

  if (secondHalf <= firstHalf - 4) {
    return "improving";
  }

  if (secondHalf >= firstHalf + 4) {
    return "declining";
  }

  return "stable";
}

export function scoreTone(score: number) {
  if (score >= 78) {
    return "text-moss";
  }

  if (score >= 62) {
    return "text-amberText";
  }

  return "text-coralText";
}

export function scoreMeterTone(score: number) {
  if (score >= 78) {
    return "bg-moss";
  }

  if (score >= 62) {
    return "bg-amber";
  }

  return "bg-coral";
}
