export type HangoutMode = 'solo' | 'friendship' | 'date';

export type DayType = 'weekday' | 'weekend';
export type TimeSlot = 'morning' | 'afternoon' | 'evening';

export type InterestTag =
  | 'outdoors'
  | 'music'
  | 'sports'
  | 'art'
  | 'history'
  | 'foodie'
  | 'adventure'
  | 'wellness'
  | 'learning'
  | 'nightlife';

export type FoodTag =
  | 'italian'
  | 'mexican'
  | 'asian'
  | 'brunch'
  | 'dessert'
  | 'vegan'
  | 'steakhouse'
  | 'seafood'
  | 'coffee'
  | 'street-food';

export type BudgetTier = 'low' | 'medium' | 'high';

export interface UserAvailability {
  preferredDayTypes: DayType[];
  preferredTimeSlots: TimeSlot[];
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  password: string;
  homeCityId: string;
  maxDriveMiles: number;
  budgetTier: BudgetTier;
  interests: InterestTag[];
  foodInterests: FoodTag[];
  availability: UserAvailability;
}

export interface City {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

export interface Venue {
  id: string;
  title: string;
  description: string;
  cityId: string;
  kind: 'food' | 'activity';
  costPerPerson: number;
  durationMinutes: number;
  lat: number;
  lng: number;
  tags: InterestTag[];
  foodTags: FoodTag[];
  suitableModes: HangoutMode[];
  dayTypes: DayType[];
  timeSlots: TimeSlot[];
}

export interface PlannerRequest {
  mode: HangoutMode;
  cityId: string;
  dayType: DayType;
  timeSlot: TimeSlot;
  participantIds: string[];
  includeFood: boolean;
  includeActivities: boolean;
  maxDriveMiles: number;
  budgetPerPerson: number;
}

export interface ScoredVenue {
  venue: Venue;
  score: number;
  distanceMiles: number;
  matchedTags: string[];
}

export interface ItineraryOption {
  id: string;
  title: string;
  summary: string;
  totalCostPerPerson: number;
  estimatedDriveMiles: number;
  score: number;
  stops: ScoredVenue[];
}
