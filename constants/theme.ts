import {
  ActivityCategory,
  BudgetLevel,
  DietaryPreference,
  EnergyLevel,
  FoodCategory,
} from '@/lib/types';

export const ACTIVITY_OPTIONS: { id: ActivityCategory; label: string; icon: string }[] = [
  { id: 'hiking', label: 'Hiking & Trails', icon: 'walk-outline' },
  { id: 'sports', label: 'Sports Events', icon: 'football-outline' },
  { id: 'concerts', label: 'Concerts & Live Music', icon: 'musical-notes-outline' },
  { id: 'museums', label: 'Museums & Galleries', icon: 'library-outline' },
  { id: 'tours', label: 'Tours & Experiences', icon: 'map-outline' },
  { id: 'movies', label: 'Movies & Theater', icon: 'film-outline' },
  { id: 'gaming', label: 'Gaming & Arcade', icon: 'game-controller-outline' },
  { id: 'wellness', label: 'Spa & Wellness', icon: 'leaf-outline' },
  { id: 'nightlife', label: 'Nightlife & Bars', icon: 'moon-outline' },
  { id: 'outdoors', label: 'Parks & Outdoors', icon: 'sunny-outline' },
  { id: 'art', label: 'Art & Workshops', icon: 'color-palette-outline' },
  { id: 'shopping', label: 'Shopping & Markets', icon: 'bag-outline' },
  { id: 'cooking', label: 'Cooking Classes', icon: 'restaurant-outline' },
  { id: 'photography', label: 'Photo Walks', icon: 'camera-outline' },
];

export const FOOD_OPTIONS: { id: FoodCategory; label: string; icon: string }[] = [
  { id: 'coffee', label: 'Coffee & Cafés', icon: 'cafe-outline' },
  { id: 'brunch', label: 'Brunch Spots', icon: 'sunny-outline' },
  { id: 'casual', label: 'Casual Dining', icon: 'fast-food-outline' },
  { id: 'fine-dining', label: 'Fine Dining', icon: 'wine-outline' },
  { id: 'street-food', label: 'Street Food', icon: 'cart-outline' },
  { id: 'dessert', label: 'Dessert & Bakeries', icon: 'ice-cream-outline' },
  { id: 'wine', label: 'Wine Bars', icon: 'wine-outline' },
  { id: 'vegetarian', label: 'Plant-Based', icon: 'leaf-outline' },
  { id: 'seafood', label: 'Seafood', icon: 'fish-outline' },
  { id: 'asian', label: 'Asian Cuisine', icon: 'restaurant-outline' },
  { id: 'italian', label: 'Italian', icon: 'pizza-outline' },
  { id: 'mexican', label: 'Mexican & Latin', icon: 'flame-outline' },
];

export const DIETARY_OPTIONS: { id: DietaryPreference; label: string }[] = [
  { id: 'none', label: 'No restrictions' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
];

export const ENERGY_OPTIONS: { id: EnergyLevel; label: string; description: string }[] = [
  { id: 'relaxed', label: 'Relaxed', description: 'Low-key, cozy vibes' },
  { id: 'moderate', label: 'Moderate', description: 'Mix of chill and active' },
  { id: 'active', label: 'Active', description: 'On your feet, high energy' },
];

export const BUDGET_OPTIONS: { id: BudgetLevel; label: string }[] = [
  { id: 'budget', label: '$ Budget-friendly' },
  { id: 'moderate', label: '$$ Moderate' },
  { id: 'upscale', label: '$$$ Upscale' },
  { id: 'splurge', label: '$$$$ Splurge' },
];

export const RADIUS_OPTIONS = [5, 10, 15, 25, 50];

export const DURATION_OPTIONS = [
  { hours: 2, label: '2 hours' },
  { hours: 4, label: 'Half day (4 hrs)' },
  { hours: 6, label: 'Most of the day (6 hrs)' },
  { hours: 8, label: 'Full day (8 hrs)' },
];

export const COLORS = {
  background: '#0f0a1a',
  surface: '#1a1228',
  surfaceLight: '#251a35',
  primary: '#e84393',
  primaryLight: '#fd79a8',
  secondary: '#6c5ce7',
  accent: '#00cec9',
  text: '#ffffff',
  textMuted: '#a29bfe',
  textSecondary: '#b2bec3',
  border: '#2d1f45',
  success: '#00b894',
  warning: '#fdcb6e',
  error: '#ff7675',
};

export const GRADIENTS = {
  primary: ['#e84393', '#6c5ce7'] as const,
  card: ['#1a1228', '#251a35'] as const,
  hero: ['#0f0a1a', '#1a0a2e', '#2d1b4e'] as const,
};
