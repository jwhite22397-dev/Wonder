import { ActivityCategory, BudgetRange } from '../types';

export const COLORS = {
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  secondary: '#EC4899',
  secondaryLight: '#F9A8D4',
  accent: '#F59E0B',
  accentLight: '#FCD34D',

  background: '#0F172A',
  surface: '#1E293B',
  surfaceLight: '#334155',
  card: '#1E293B',
  cardBorder: '#334155',

  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  solo: '#F59E0B',
  friends: '#10B981',
  date: '#EC4899',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const GRADIENTS = {
  primary: ['#7C3AED', '#EC4899'] as string[],
  solo: ['#F59E0B', '#EF4444'] as string[],
  friends: ['#10B981', '#3B82F6'] as string[],
  date: ['#EC4899', '#7C3AED'] as string[],
  dark: ['#0F172A', '#1E293B'] as string[],
  card: ['#1E293B', '#0F172A'] as string[],
};

export const ACTIVITY_CATEGORIES: { value: ActivityCategory; label: string; emoji: string; description: string }[] = [
  { value: 'outdoor', label: 'Outdoors', emoji: '🌿', description: 'Hikes, parks, nature walks' },
  { value: 'sports', label: 'Sports', emoji: '⚽', description: 'Games, matches, fitness' },
  { value: 'arts', label: 'Arts', emoji: '🎨', description: 'Galleries, museums, studios' },
  { value: 'music', label: 'Music', emoji: '🎵', description: 'Concerts, live shows, festivals' },
  { value: 'food', label: 'Food & Drink', emoji: '🍽️', description: 'Restaurants, cafes, markets' },
  { value: 'nightlife', label: 'Nightlife', emoji: '🌙', description: 'Bars, clubs, late-night spots' },
  { value: 'wellness', label: 'Wellness', emoji: '🧘', description: 'Spas, yoga, meditation' },
  { value: 'learning', label: 'Learning', emoji: '📚', description: 'Classes, workshops, tours' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️', description: 'Markets, boutiques, malls' },
  { value: 'adventure', label: 'Adventure', emoji: '🎢', description: 'Thrill activities, escapes' },
  { value: 'culture', label: 'Culture', emoji: '🏛️', description: 'History, heritage, traditions' },
  { value: 'gaming', label: 'Gaming', emoji: '🎮', description: 'Arcades, VR, board games' },
  { value: 'movies', label: 'Movies', emoji: '🎬', description: 'Cinema, drive-ins, screenings' },
  { value: 'relaxation', label: 'Relaxation', emoji: '☕', description: 'Cozy spots, picnics, lounges' },
];

export const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥦' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'gluten-free', label: 'Gluten-Free', emoji: '🌾' },
  { value: 'halal', label: 'Halal', emoji: '☪️' },
  { value: 'kosher', label: 'Kosher', emoji: '✡️' },
  { value: 'dairy-free', label: 'Dairy-Free', emoji: '🥛' },
  { value: 'nut-free', label: 'Nut-Free', emoji: '🥜' },
  { value: 'seafood-free', label: 'No Seafood', emoji: '🐟' },
];

export const VIBE_OPTIONS = [
  { value: 'chill', label: 'Chill & Relaxed', emoji: '😌' },
  { value: 'adventurous', label: 'Adventurous', emoji: '🏔️' },
  { value: 'romantic', label: 'Romantic', emoji: '💕' },
  { value: 'social', label: 'Social & Lively', emoji: '🥂' },
  { value: 'intellectual', label: 'Intellectual', emoji: '🧠' },
  { value: 'active', label: 'Active & Sporty', emoji: '💪' },
  { value: 'artsy', label: 'Artsy & Creative', emoji: '🎭' },
  { value: 'foodie', label: 'Foodie', emoji: '🍜' },
  { value: 'spiritual', label: 'Mindful & Spiritual', emoji: '🕊️' },
  { value: 'luxurious', label: 'Luxurious', emoji: '✨' },
];

export const BUDGET_OPTIONS: { value: BudgetRange; label: string; description: string; emoji: string }[] = [
  { value: 'free', label: 'Free', description: 'No spend needed', emoji: '🤲' },
  { value: 'budget', label: 'Budget', description: 'Under $20/person', emoji: '💵' },
  { value: 'moderate', label: 'Moderate', description: '$20–$60/person', emoji: '💳' },
  { value: 'upscale', label: 'Upscale', description: '$60–$150/person', emoji: '🍾' },
  { value: 'luxury', label: 'Luxury', description: '$150+/person', emoji: '💎' },
];

export const RADIUS_OPTIONS = [5, 10, 15, 25, 50, 100];

export const PLAN_MODES = [
  {
    value: 'solo' as const,
    label: 'Solo',
    description: 'A perfect day just for you',
    emoji: '🎯',
    gradient: GRADIENTS.solo,
  },
  {
    value: 'friends' as const,
    label: 'Friends',
    description: 'Create memories together',
    emoji: '🤝',
    gradient: GRADIENTS.friends,
  },
  {
    value: 'date' as const,
    label: 'Date',
    description: 'Make it special',
    emoji: '💞',
    gradient: GRADIENTS.date,
  },
];
