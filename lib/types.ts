export type PublicGrade = "A" | "B" | "C" | "Pending" | "Not Yet Graded";

export type Trajectory = "improving" | "stable" | "declining" | "volatile";

export type ConfidenceLevel = "high" | "medium" | "limited";

export type SanoLabel =
  | "Consistent record"
  | "Improving record"
  | "Volatile history"
  | "Recent critical flag"
  | "Limited data";

export type Inspection = {
  id: string;
  date: string;
  score: number;
  grade: PublicGrade;
  criticalCount: number;
  violationCodes: string[];
  repeatPattern: boolean;
  note: string;
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  neighborhood: string;
  borough: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  priceLevel: "$" | "$$" | "$$$";
  grade: PublicGrade;
  inspectionReliabilityScore: number;
  trajectory: Trajectory;
  trustGap: number;
  confidence: ConfidenceLevel;
  sanoLabel: SanoLabel;
  explanation: string;
  dataAsOf: string;
  inspections: Inspection[];
  alternatives: string[];
  sourceNotes: string;
};

export type RestaurantFilters = {
  query: string;
  cuisine: string;
  trajectory: "all" | Trajectory;
  confidence: "all" | ConfidenceLevel;
  recentCriticalOnly: boolean;
};
