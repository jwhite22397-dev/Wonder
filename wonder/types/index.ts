export type PlanMode = 'solo' | 'friends' | 'date';

export type BudgetRange = 'free' | 'budget' | 'moderate' | 'upscale' | 'luxury';

export type ActivityCategory =
  | 'outdoor'
  | 'sports'
  | 'arts'
  | 'music'
  | 'food'
  | 'nightlife'
  | 'wellness'
  | 'learning'
  | 'shopping'
  | 'adventure'
  | 'culture'
  | 'gaming'
  | 'movies'
  | 'relaxation';

export interface UserInterests {
  categories: ActivityCategory[];
  dietaryPreferences: string[];
  favoriteVibe: string[];
  avoidCategories: ActivityCategory[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  interests: UserInterests;
  onboardingComplete: boolean;
  createdAt: number;
}

export interface PlanRequest {
  mode: PlanMode;
  date: string; // ISO date string
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  radiusMiles: number;
  budget: BudgetRange;
  groupSize: number;
  specialRequests?: string;
  partnerInterests?: UserInterests;
}

export interface ItineraryStop {
  time: string;
  duration: string;
  name: string;
  type: 'activity' | 'food' | 'travel' | 'rest';
  category: string;
  description: string;
  address?: string;
  estimatedCost?: string;
  tips?: string;
  emoji: string;
}

export interface Itinerary {
  id: string;
  title: string;
  tagline: string;
  vibe: string;
  totalEstimatedCost: string;
  totalDuration: string;
  highlights: string[];
  stops: ItineraryStop[];
  bestFor: string;
  emoji: string;
}

export interface GeneratedPlans {
  plan1: Itinerary;
  plan2: Itinerary;
  plan3: Itinerary;
}
