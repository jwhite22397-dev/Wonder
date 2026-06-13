import { ActivityCategory, BudgetLevel, FoodCategory, PlanMode, Venue } from './types';

function v(
  id: string,
  name: string,
  type: 'activity' | 'food',
  category: ActivityCategory | FoodCategory,
  description: string,
  priceLevel: BudgetLevel,
  durationMinutes: number,
  rating: number,
  tags: string[],
  modes: PlanMode[],
  latOffset: number,
  lngOffset: number
): Venue {
  return {
    id,
    name,
    type,
    category,
    description,
    priceLevel,
    durationMinutes,
    rating,
    tags,
    modes,
    lat: latOffset,
    lng: lngOffset,
  };
}

export const VENUE_TEMPLATES: Venue[] = [
  v('hike1', 'Sunrise Ridge Trail', 'activity', 'hiking', 'Scenic 3-mile loop with panoramic city views', 'budget', 120, 4.8, ['outdoor', 'scenic', 'active'], ['solo', 'friends', 'date'], 0.02, 0.01),
  v('hike2', 'Hidden Falls Path', 'activity', 'hiking', 'Gentle waterfall trail perfect for conversation', 'budget', 90, 4.6, ['outdoor', 'romantic', 'relaxed'], ['solo', 'friends', 'date'], -0.015, 0.025),
  v('sport1', 'Local Arena — Game Night', 'activity', 'sports', 'Catch a live game with great stadium food', 'moderate', 180, 4.5, ['live', 'energetic', 'group'], ['friends', 'date'], 0.03, -0.01),
  v('sport2', 'Pickleball Social Club', 'activity', 'sports', 'Drop-in courts with rentals available', 'budget', 90, 4.3, ['active', 'social', 'fun'], ['solo', 'friends'], 0.01, 0.02),
  v('concert1', 'The Velvet Room', 'activity', 'concerts', 'Intimate live music venue with local bands', 'moderate', 150, 4.7, ['live', 'night', 'romantic'], ['friends', 'date'], -0.02, -0.015),
  v('concert2', 'Summer Amphitheater', 'activity', 'concerts', 'Outdoor concert series under the stars', 'moderate', 180, 4.9, ['outdoor', 'live', 'special'], ['friends', 'date'], 0.04, 0.03),
  v('museum1', 'Modern Art Museum', 'activity', 'museums', 'Rotating exhibits and rooftop sculpture garden', 'moderate', 120, 4.6, ['culture', 'indoor', 'thoughtful'], ['solo', 'friends', 'date'], 0.005, 0.008),
  v('museum2', 'Natural History Center', 'activity', 'museums', 'Interactive exhibits and planetarium shows', 'moderate', 150, 4.4, ['family', 'indoor', 'educational'], ['solo', 'friends', 'date'], -0.008, 0.012),
  v('tour1', 'Historic Downtown Walking Tour', 'activity', 'tours', 'Guided stroll through hidden gems and murals', 'budget', 90, 4.5, ['outdoor', 'culture', 'social'], ['solo', 'friends', 'date'], 0.001, 0.001),
  v('tour2', 'Food & Culture Tour', 'activity', 'tours', 'Sample bites while learning local history', 'moderate', 150, 4.8, ['food', 'culture', 'group'], ['friends', 'date'], 0.002, -0.003),
  v('tour3', 'Sunset Kayak Tour', 'activity', 'tours', 'Paddle through calm waters at golden hour', 'upscale', 120, 4.9, ['outdoor', 'romantic', 'active'], ['date', 'friends'], 0.035, -0.02),
  v('movie1', 'Indie Cinema House', 'activity', 'movies', 'Art-house films with cozy seating and wine', 'moderate', 130, 4.5, ['indoor', 'cozy', 'date-night'], ['solo', 'friends', 'date'], -0.01, 0.005),
  v('game1', 'Pixel Palace Arcade', 'activity', 'gaming', 'Retro and modern games with craft beer bar', 'moderate', 120, 4.4, ['indoor', 'fun', 'nostalgic'], ['friends', 'date'], 0.012, -0.008),
  v('well1', 'Serenity Spa & Float', 'activity', 'wellness', 'Couples massage and sensory float tanks', 'upscale', 150, 4.7, ['relaxing', 'romantic', 'indoor'], ['solo', 'date'], -0.005, -0.012),
  v('night1', 'Rooftop Cocktail Lounge', 'activity', 'nightlife', 'Craft cocktails with skyline views', 'upscale', 120, 4.6, ['night', 'romantic', 'views'], ['friends', 'date'], 0.003, 0.002),
  v('out1', 'Botanical Gardens', 'activity', 'outdoors', 'Lush gardens, koi ponds, and seasonal blooms', 'budget', 90, 4.7, ['outdoor', 'peaceful', 'photo'], ['solo', 'friends', 'date'], 0.018, 0.022),
  v('out2', 'Lakefront Picnic Park', 'activity', 'outdoors', 'Rent a paddleboat or spread a blanket by the water', 'budget', 120, 4.5, ['outdoor', 'relaxed', 'budget'], ['solo', 'friends', 'date'], -0.025, 0.015),
  v('art1', 'Pottery Studio Workshop', 'activity', 'art', 'Hands-on wheel throwing with take-home pieces', 'moderate', 120, 4.8, ['creative', 'hands-on', 'date-night'], ['solo', 'friends', 'date'], 0.007, -0.005),
  v('shop1', 'Artisan Market Square', 'activity', 'shopping', 'Local makers, vintage finds, and live buskers', 'moderate', 90, 4.3, ['outdoor', 'browsing', 'social'], ['solo', 'friends', 'date'], 0.004, 0.006),
  v('cook1', 'Pasta Making Class', 'activity', 'cooking', 'Learn to make fresh pasta from a local chef', 'upscale', 150, 4.9, ['hands-on', 'food', 'date-night'], ['friends', 'date'], -0.003, 0.009),
  v('photo1', 'Golden Hour Photo Walk', 'activity', 'photography', 'Guided walk to the city\'s most photogenic spots', 'budget', 90, 4.4, ['outdoor', 'creative', 'scenic'], ['solo', 'friends', 'date'], 0.011, -0.011),

  v('food1', 'Morning Glory Café', 'food', 'coffee', 'Specialty lattes and fresh pastries', 'budget', 45, 4.6, ['morning', 'cozy'], ['solo', 'friends', 'date'], 0.003, 0.004),
  v('food2', 'The Brunch Collective', 'food', 'brunch', 'Bottomless mimosas and avocado toast flights', 'moderate', 75, 4.5, ['morning', 'social'], ['friends', 'date'], -0.002, 0.006),
  v('food3', 'Taco Libre', 'food', 'mexican', 'Street-style tacos and house-made agua fresca', 'budget', 60, 4.7, ['casual', 'lively'], ['solo', 'friends', 'date'], 0.008, -0.004),
  v('food4', 'Nonna\'s Table', 'food', 'italian', 'Homemade pasta in a candlelit trattoria', 'upscale', 90, 4.8, ['romantic', 'date-night'], ['date', 'friends'], -0.004, 0.003),
  v('food5', 'Green Bowl Kitchen', 'food', 'vegetarian', 'Farm-to-table plant-based bowls and smoothies', 'moderate', 60, 4.5, ['healthy', 'casual'], ['solo', 'friends', 'date'], 0.006, 0.007),
  v('food6', 'Harbor Catch', 'food', 'seafood', 'Fresh oysters and catch-of-the-day', 'upscale', 90, 4.6, ['romantic', 'waterfront'], ['date', 'friends'], 0.015, -0.018),
  v('food7', 'Ramen Republic', 'food', 'asian', 'Rich broths and handmade noodles', 'moderate', 60, 4.4, ['cozy', 'casual'], ['solo', 'friends', 'date'], -0.006, -0.002),
  v('food8', 'Sweet Surrender', 'food', 'dessert', 'Artisan gelato and French macarons', 'budget', 30, 4.8, ['sweet', 'date-night'], ['solo', 'friends', 'date'], 0.002, 0.001),
  v('food9', 'The Garden Bistro', 'food', 'casual', 'Seasonal menu with patio seating', 'moderate', 75, 4.5, ['outdoor', 'relaxed'], ['solo', 'friends', 'date'], 0.009, 0.011),
  v('food10', 'Ember & Oak', 'food', 'fine-dining', 'Tasting menu with wine pairings', 'splurge', 120, 4.9, ['special', 'romantic'], ['date'], -0.001, -0.006),
  v('food11', 'Night Market Stalls', 'food', 'street-food', 'Global street food under string lights', 'budget', 45, 4.4, ['lively', 'evening'], ['friends', 'date'], 0.005, -0.009),
  v('food12', 'Vino & Vinyl', 'food', 'wine', 'Natural wines and small plates with live DJ sets', 'upscale', 90, 4.6, ['night', 'romantic'], ['date', 'friends'], -0.007, 0.014),
  v('food13', 'Sunrise Diner', 'food', 'brunch', 'Classic diner with all-day breakfast', 'budget', 60, 4.3, ['casual', 'comfort'], ['solo', 'friends'], 0.01, -0.007),
  v('food14', 'Sakura Sushi Bar', 'food', 'asian', 'Omakase and sake flights at the sushi counter', 'upscale', 90, 4.7, ['date-night', 'special'], ['date', 'friends'], -0.009, 0.005),
];

const BUDGET_ORDER: BudgetLevel[] = ['budget', 'moderate', 'upscale', 'splurge'];

export function budgetWithinLimit(venueBudget: BudgetLevel, maxBudget: BudgetLevel): boolean {
  return BUDGET_ORDER.indexOf(venueBudget) <= BUDGET_ORDER.indexOf(maxBudget);
}

export function localizeVenues(baseLat: number, baseLng: number, radiusMiles: number): Venue[] {
  const radiusDeg = radiusMiles / 69;
  return VENUE_TEMPLATES.map((venue) => ({
    ...venue,
    lat: baseLat + venue.lat * radiusDeg,
    lng: baseLng + venue.lng * radiusDeg,
  }));
}

export function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
