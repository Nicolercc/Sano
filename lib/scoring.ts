import type {
  ConfidenceLevel,
  Inspection,
  Restaurant,
  SanoLabel,
  Trajectory
} from "./types";

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function hasRecentCriticalFlag(restaurant: Restaurant) {
  const sorted = [...restaurant.inspections].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  return sorted.slice(0, 2).some((inspection) => inspection.criticalCount > 0);
}

export function averageInspectionScore(inspections: Inspection[]) {
  if (!inspections.length) {
    return 0;
  }

  return (
    inspections.reduce((total, inspection) => total + inspection.score, 0) /
    inspections.length
  );
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

export function calculateInspectionReliabilityScore(
  inspections: Inspection[]
) {
  if (!inspections.length) {
    return 0;
  }

  const ordered = [...inspections].sort((a, b) => b.date.localeCompare(a.date));
  const recent = ordered[0];
  const averageScore = averageInspectionScore(ordered);
  const criticalPenalty = ordered.reduce(
    (total, inspection) => total + inspection.criticalCount * 4,
    0
  );
  const repeatPenalty = ordered.filter((inspection) => inspection.repeatPattern)
    .length * 5;
  const volatilityPenalty =
    deriveTrajectory(ordered) === "volatile" ? 12 : 0;
  const improvementBonus =
    deriveTrajectory(ordered) === "improving" ? 7 : 0;

  return Math.round(
    clamp(
      100 -
        averageScore * 1.7 -
        recent.score * 0.6 -
        criticalPenalty -
        repeatPenalty -
        volatilityPenalty +
        improvementBonus
    )
  );
}

export function deriveConfidence(restaurant: Pick<Restaurant, "inspections">) {
  if (restaurant.inspections.length >= 5) {
    return "high";
  }

  if (restaurant.inspections.length >= 3) {
    return "medium";
  }

  return "limited";
}

export function labelForRestaurant(
  score: number,
  trajectory: Trajectory,
  confidence: ConfidenceLevel,
  recentCritical: boolean
): SanoLabel {
  if (confidence === "limited") {
    return "Limited data";
  }

  if (recentCritical) {
    return "Recent critical flag";
  }

  if (trajectory === "volatile" || score < 62) {
    return "Volatile history";
  }

  if (trajectory === "improving") {
    return "Improving record";
  }

  return "Consistent record";
}

export function scoreTone(score: number) {
  if (score >= 78) {
    return "text-moss";
  }

  if (score >= 62) {
    return "text-amber";
  }

  return "text-coral";
}

export function confidenceTone(confidence: ConfidenceLevel) {
  const tones: Record<ConfidenceLevel, string> = {
    high: "bg-mint text-moss",
    medium: "bg-amber/15 text-amber",
    limited: "bg-coral/10 text-coral"
  };

  return tones[confidence];
}
