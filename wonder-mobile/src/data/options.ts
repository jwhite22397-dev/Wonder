import { BudgetTier, DayType, FoodTag, HangoutMode, InterestTag, TimeSlot } from '../types';

export const MODE_OPTIONS: Array<{ label: string; value: HangoutMode }> = [
  { label: 'Solo', value: 'solo' },
  { label: 'Friendship', value: 'friendship' },
  { label: 'Date', value: 'date' },
];

export const DAY_OPTIONS: Array<{ label: string; value: DayType }> = [
  { label: 'Weekday', value: 'weekday' },
  { label: 'Weekend', value: 'weekend' },
];

export const TIME_OPTIONS: Array<{ label: string; value: TimeSlot }> = [
  { label: 'Morning', value: 'morning' },
  { label: 'Afternoon', value: 'afternoon' },
  { label: 'Evening', value: 'evening' },
];

export const INTEREST_OPTIONS: Array<{ label: string; value: InterestTag }> = [
  { label: 'Outdoors', value: 'outdoors' },
  { label: 'Music', value: 'music' },
  { label: 'Sports', value: 'sports' },
  { label: 'Art', value: 'art' },
  { label: 'History', value: 'history' },
  { label: 'Foodie', value: 'foodie' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Wellness', value: 'wellness' },
  { label: 'Learning', value: 'learning' },
  { label: 'Nightlife', value: 'nightlife' },
];

export const FOOD_OPTIONS: Array<{ label: string; value: FoodTag }> = [
  { label: 'Italian', value: 'italian' },
  { label: 'Mexican', value: 'mexican' },
  { label: 'Asian', value: 'asian' },
  { label: 'Brunch', value: 'brunch' },
  { label: 'Dessert', value: 'dessert' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Steakhouse', value: 'steakhouse' },
  { label: 'Seafood', value: 'seafood' },
  { label: 'Coffee', value: 'coffee' },
  { label: 'Street Food', value: 'street-food' },
];

export const BUDGET_OPTIONS: Array<{ label: string; value: BudgetTier }> = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];
