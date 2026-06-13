export type PlanMode = 'solo' | 'friends' | 'date';

export type BudgetLevel = 'budget' | 'moderate' | 'upscale' | 'splurge';

export type ActivityCategory =
  | 'hiking'
  | 'sports'
  | 'concerts'
  | 'museums'
  | 'tours'
  | 'movies'
  | 'gaming'
  | 'wellness'
  | 'nightlife'
  | 'outdoors'
  | 'art'
  | 'shopping'
  | 'cooking'
  | 'photography';

export type FoodCategory =
  | 'coffee'
  | 'brunch'
  | 'casual'
  | 'fine-dining'
  | 'street-food'
  | 'dessert'
  | 'wine'
  | 'vegetarian'
  | 'seafood'
  | 'asian'
  | 'italian'
  | 'mexican';

export type DietaryPreference = 'none' | 'vegetarian' | 'vegan' | 'gluten-free' | 'halal' | 'kosher';

export type EnergyLevel = 'relaxed' | 'moderate' | 'active';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  interests: ActivityCategory[];
  foodPreferences: FoodCategory[];
  dietaryRestrictions: DietaryPreference[];
  energyLevel: EnergyLevel;
  defaultBudget: BudgetLevel;
  defaultRadiusMiles: number;
  surveyCompleted: boolean;
  createdAt: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
  label?: string;
}

export interface PlanRequest {
  mode: PlanMode;
  participantIds: string[];
  date: string;
  startTime: string;
  durationHours: number;
  location: LocationCoords;
  budget: BudgetLevel;
  radiusMiles: number;
  includeFood: boolean;
  includeActivities: boolean;
}

export interface Venue {
  id: string;
  name: string;
  type: 'activity' | 'food';
  category: ActivityCategory | FoodCategory;
  description: string;
  priceLevel: BudgetLevel;
  durationMinutes: number;
  rating: number;
  tags: string[];
  modes: PlanMode[];
  lat: number;
  lng: number;
}

export interface ItineraryStop {
  time: string;
  venue: Venue;
  note?: string;
}

export interface Itinerary {
  id: string;
  title: string;
  subtitle: string;
  totalCostEstimate: string;
  totalDurationMinutes: number;
  stops: ItineraryStop[];
  score: number;
  highlights: string[];
}

export interface SavedPlan {
  id: string;
  request: PlanRequest;
  itineraries: Itinerary[];
  selectedItineraryId?: string;
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  email: string;
}

export const BUDGET_LABELS: Record<BudgetLevel, string> = {
  budget: '$ (Under $30/person)',
  moderate: '$$ ($30–60/person)',
  upscale: '$$$ ($60–120/person)',
  splurge: '$$$$ ($120+/person)',
};

export const MODE_LABELS: Record<PlanMode, { title: string; subtitle: string; icon: string }> = {
  solo: {
    title: 'Solo Adventure',
    subtitle: 'Treat yourself to a perfect day out',
    icon: 'person-outline',
  },
  friends: {
    title: 'Friends Hangout',
    subtitle: 'Plan something fun for the group',
    icon: 'people-outline',
  },
  date: {
    title: 'Date Night',
    subtitle: 'Curated plans for you and your partner',
    icon: 'heart-outline',
  },
};
