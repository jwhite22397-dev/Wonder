// The shared interest taxonomy. This is the single source of truth used by:
//  - the sign-up survey (rendered on the client via /api/taxonomy)
//  - the scoring engine (matching people to venues)
//  - the venue catalog (each venue is tagged with these ids)

export const INTEREST_GROUPS = [
  {
    id: 'food',
    label: 'Food & Drink',
    hint: 'What do you love to eat?',
    tags: [
      { id: 'italian', label: 'Italian' },
      { id: 'mexican', label: 'Mexican' },
      { id: 'japanese', label: 'Japanese / Sushi' },
      { id: 'chinese', label: 'Chinese' },
      { id: 'thai', label: 'Thai' },
      { id: 'indian', label: 'Indian' },
      { id: 'korean', label: 'Korean' },
      { id: 'mediterranean', label: 'Mediterranean' },
      { id: 'american', label: 'American / BBQ' },
      { id: 'seafood', label: 'Seafood' },
      { id: 'vegetarian_food', label: 'Vegetarian / Vegan' },
      { id: 'cafe', label: 'Cafés & Bakeries' },
      { id: 'dessert', label: 'Dessert & Ice cream' },
      { id: 'breweries', label: 'Breweries & Wine' },
    ],
  },
  {
    id: 'activities',
    label: 'Activities',
    hint: 'What kinds of things do you like to do?',
    tags: [
      { id: 'hiking', label: 'Hiking & Outdoors' },
      { id: 'sports_watch', label: 'Watching sports' },
      { id: 'sports_play', label: 'Playing sports' },
      { id: 'concerts', label: 'Live music & Concerts' },
      { id: 'museums', label: 'Museums & Art' },
      { id: 'tours', label: 'Tours & Sightseeing' },
      { id: 'nightlife', label: 'Bars & Nightlife' },
      { id: 'shopping', label: 'Shopping & Markets' },
      { id: 'movies', label: 'Movies & Theater' },
      { id: 'arcade', label: 'Arcades & Games' },
      { id: 'wellness', label: 'Spa & Wellness' },
      { id: 'water', label: 'Water activities' },
      { id: 'comedy', label: 'Comedy' },
      { id: 'classes', label: 'Classes & Workshops' },
      { id: 'animals', label: 'Zoos & Aquariums' },
      { id: 'thrill', label: 'Thrill & Adventure' },
    ],
  },
];

// Vibe sliders shape the *feel* of an itinerary rather than a hard match.
export const VIBES = [
  {
    id: 'pace',
    label: 'Your ideal pace',
    low: 'Relaxed & cozy',
    high: 'Active & adventurous',
  },
  {
    id: 'social',
    label: 'Atmosphere',
    low: 'Quiet & intimate',
    high: 'Lively & social',
  },
  {
    id: 'novelty',
    label: 'Familiarity',
    low: 'Tried & true favorites',
    high: 'Surprise me with new things',
  },
];

export const DIETARY = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten_free', label: 'Gluten-free' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'no_alcohol', label: 'No alcohol' },
];

export const MODES = [
  {
    id: 'solo',
    label: 'Solo',
    blurb: 'Treat yourself — a plan just for you.',
    emoji: '\u{1F9D8}',
  },
  {
    id: 'friends',
    label: 'Friends',
    blurb: 'Hang out with the crew.',
    emoji: '\u{1F46F}',
  },
  {
    id: 'date',
    label: 'Date',
    blurb: 'Something special for two.',
    emoji: '\u{1F495}',
  },
];

// Convenience lookups
export const ALL_TAGS = INTEREST_GROUPS.flatMap((g) => g.tags.map((t) => t.id));
export const FOOD_TAGS = INTEREST_GROUPS.find((g) => g.id === 'food').tags.map((t) => t.id);
export const ACTIVITY_TAGS = INTEREST_GROUPS.find((g) => g.id === 'activities').tags.map((t) => t.id);

export function isValidTag(tagId) {
  return ALL_TAGS.includes(tagId);
}
