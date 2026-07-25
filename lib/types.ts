export type PublicGrade = "A" | "B" | "C" | "Pending" | "Not Yet Graded";

export type Trajectory = "improving" | "stable" | "declining" | "volatile";

export type ConfidenceLevel = "high" | "medium" | "limited";

export type SanoLabel =
  | "Consistent record"
  | "Improving record"
  | "Volatile history"
  | "Recent critical flag"
  | "Limited data";

export type MetadataProvider = "google-places" | "yelp-fusion";

export type PlaceMetadata = {
  restaurantId: string;
  provider: MetadataProvider;
  providerPlaceId: string;
  displayName: string;
  formattedAddress: string;
  rating: number | null;
  reviewCount: number | null;
  priceLevel: "$" | "$$" | "$$$" | null;
  googleMapsUri?: string;
  yelpUrl?: string;
  fetchedAt: string;
  matchConfidence: "high" | "medium" | "low";
};

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
  placeMetadata?: PlaceMetadata;
};

export type RestaurantFilters = {
  query: string;
  cuisine: string;
  trajectory: "all" | Trajectory;
  confidence: "all" | ConfidenceLevel;
  recentCriticalOnly: boolean;
};
