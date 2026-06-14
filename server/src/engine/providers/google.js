// Google Places API (New) provider.
//
// When GOOGLE_MAPS_API_KEY (or GOOGLE_PLACES_API_KEY) is set, Wonder fetches real
// nearby venues via the Nearby Search (New) endpoint and maps them into the same
// venue shape the itinerary engine uses. Without a key, the engine falls back to the
// built-in demo catalog. If a live call fails for any reason, we also fall back.
//
// Docs: https://developers.google.com/maps/documentation/places/web-service/nearby-search

import { haversineMiles } from '../geo.js';

const NEARBY_URL = 'https://places.googleapis.com/v1/places:searchNearby';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const cache = new Map();

export function getApiKey() {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';
}
export function isGoogleEnabled() {
  return !!getApiKey();
}

const PRICE_ENUM = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

// Attribute bases shared by many place types.
const B = {
  resto: { kind: 'food', meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], durationMin: 80, energy: 0.35, social: 0.6, indoor: true, romantic: 0.55, diet: [], suited: { solo: 0.6, friends: 0.9, date: 0.85 }, price: 2 },
  cafe: { kind: 'food', tags: ['cafe'], meals: ['breakfast', 'drinks'], dayparts: ['morning', 'afternoon'], durationMin: 45, energy: 0.2, social: 0.5, indoor: true, romantic: 0.45, diet: ['vegetarian'], suited: { solo: 1, friends: 0.9, date: 0.8 }, price: 1 },
  dessert: { kind: 'food', tags: ['dessert'], meals: ['dessert'], dayparts: ['afternoon', 'evening'], durationMin: 35, energy: 0.2, social: 0.5, indoor: true, romantic: 0.75, diet: ['vegetarian'], suited: { solo: 0.7, friends: 0.85, date: 0.95 }, price: 1 },
  bar: { kind: 'food', tags: ['breweries', 'nightlife'], meals: ['drinks'], dayparts: ['evening'], durationMin: 75, energy: 0.55, social: 0.9, indoor: true, romantic: 0.55, diet: [], suited: { solo: 0.4, friends: 1, date: 0.7 }, price: 2 },
  act: { kind: 'activity', dayparts: ['morning', 'afternoon'], durationMin: 90, energy: 0.4, social: 0.5, indoor: true, romantic: 0.5, diet: [], suited: { solo: 0.8, friends: 0.9, date: 0.8 }, price: 1 },
  outdoor: { kind: 'activity', dayparts: ['morning', 'afternoon'], durationMin: 90, energy: 0.6, social: 0.4, indoor: false, romantic: 0.65, diet: [], suited: { solo: 0.9, friends: 1, date: 0.85 }, price: 0 },
};

// Google place type -> venue attributes.
const TYPE_MAP = {
  // --- generic food (kept generic so cuisine-specific types win) ---
  restaurant: { ...B.resto, tags: [] },
  // --- cuisine restaurants ---
  american_restaurant: { ...B.resto, tags: ['american'] },
  steak_house: { ...B.resto, tags: ['american'], price: 3, romantic: 0.75 },
  barbecue_restaurant: { ...B.resto, tags: ['american'] },
  hamburger_restaurant: { ...B.resto, tags: ['american'], price: 1, durationMin: 50, romantic: 0.2, suited: { solo: 0.9, friends: 1, date: 0.4 } },
  fast_food_restaurant: { ...B.resto, tags: ['american'], price: 1, durationMin: 40, romantic: 0.1, suited: { solo: 0.9, friends: 0.8, date: 0.2 } },
  pizza_restaurant: { ...B.resto, tags: ['italian'], price: 2, romantic: 0.4 },
  italian_restaurant: { ...B.resto, tags: ['italian'], romantic: 0.8 },
  french_restaurant: { ...B.resto, tags: ['mediterranean'], price: 3, romantic: 0.9 },
  mexican_restaurant: { ...B.resto, tags: ['mexican'] },
  spanish_restaurant: { ...B.resto, tags: ['mediterranean'] },
  greek_restaurant: { ...B.resto, tags: ['mediterranean'], diet: ['vegetarian'] },
  mediterranean_restaurant: { ...B.resto, tags: ['mediterranean'], diet: ['vegetarian'] },
  middle_eastern_restaurant: { ...B.resto, tags: ['mediterranean'], diet: ['vegetarian', 'halal'] },
  lebanese_restaurant: { ...B.resto, tags: ['mediterranean'], diet: ['vegetarian', 'halal'] },
  turkish_restaurant: { ...B.resto, tags: ['mediterranean'], diet: ['halal'] },
  japanese_restaurant: { ...B.resto, tags: ['japanese'], romantic: 0.7 },
  sushi_restaurant: { ...B.resto, tags: ['japanese', 'seafood'], price: 3, romantic: 0.8 },
  ramen_restaurant: { ...B.resto, tags: ['japanese'], price: 2, durationMin: 55, suited: { solo: 1, friends: 0.9, date: 0.7 } },
  chinese_restaurant: { ...B.resto, tags: ['chinese'] },
  thai_restaurant: { ...B.resto, tags: ['thai'], diet: ['vegetarian', 'vegan'] },
  indian_restaurant: { ...B.resto, tags: ['indian'], diet: ['vegetarian', 'vegan', 'halal'] },
  korean_restaurant: { ...B.resto, tags: ['korean'] },
  vietnamese_restaurant: { ...B.resto, tags: ['thai'] },
  seafood_restaurant: { ...B.resto, tags: ['seafood'], price: 3, romantic: 0.7 },
  vegetarian_restaurant: { ...B.resto, tags: ['vegetarian_food'], diet: ['vegetarian', 'vegan'] },
  vegan_restaurant: { ...B.resto, tags: ['vegetarian_food'], diet: ['vegetarian', 'vegan'] },
  breakfast_restaurant: { ...B.cafe, tags: ['cafe', 'american'], meals: ['breakfast', 'lunch'], durationMin: 60, suited: { solo: 0.8, friends: 1, date: 0.85 } },
  brunch_restaurant: { ...B.cafe, tags: ['cafe', 'american'], meals: ['breakfast', 'lunch'], durationMin: 70, suited: { solo: 0.7, friends: 1, date: 0.9 } },
  diner: { ...B.resto, tags: ['american'], price: 1, meals: ['breakfast', 'lunch', 'dinner'], dayparts: ['morning', 'afternoon', 'evening'] },
  // --- cafes / dessert ---
  cafe: { ...B.cafe, tags: ['cafe'] },
  coffee_shop: { ...B.cafe, tags: ['cafe'] },
  tea_house: { ...B.cafe, tags: ['cafe'] },
  bakery: { ...B.cafe, tags: ['cafe', 'dessert'], meals: ['breakfast', 'dessert'] },
  dessert_shop: { ...B.dessert },
  ice_cream_shop: { ...B.dessert, durationMin: 30 },
  donut_shop: { ...B.dessert, meals: ['breakfast', 'dessert'] },
  chocolate_shop: { ...B.dessert },
  juice_shop: { ...B.cafe, tags: ['cafe'], diet: ['vegetarian', 'vegan'] },
  // --- bars / nightlife ---
  bar: { ...B.bar },
  pub: { ...B.bar },
  bar_and_grill: { ...B.bar, meals: ['dinner', 'drinks'], tags: ['breweries', 'nightlife', 'american'] },
  wine_bar: { ...B.bar, tags: ['breweries'], price: 3, romantic: 0.9, social: 0.6, energy: 0.3, suited: { solo: 0.4, friends: 0.8, date: 1 } },
  night_club: { ...B.act, tags: ['nightlife'], dayparts: ['evening'], durationMin: 120, energy: 0.8, social: 1, indoor: true, romantic: 0.4, suited: { solo: 0.2, friends: 1, date: 0.6 }, price: 2 },
  // --- outdoors ---
  park: { ...B.outdoor, tags: ['hiking'], durationMin: 75, energy: 0.5, romantic: 0.7 },
  national_park: { ...B.outdoor, tags: ['hiking', 'thrill'], durationMin: 150, energy: 0.85 },
  state_park: { ...B.outdoor, tags: ['hiking', 'thrill'], durationMin: 150, energy: 0.85 },
  garden: { ...B.outdoor, tags: ['hiking', 'tours'], durationMin: 75, romantic: 0.85, price: 1 },
  botanical_garden: { ...B.outdoor, tags: ['hiking', 'tours'], durationMin: 90, romantic: 0.95, price: 1 },
  hiking_area: { ...B.outdoor, tags: ['hiking', 'thrill'], durationMin: 120, energy: 0.9, romantic: 0.65 },
  beach: { ...B.outdoor, tags: ['water', 'tours'], durationMin: 90, romantic: 0.85 },
  marina: { ...B.outdoor, tags: ['water', 'tours'], durationMin: 75, romantic: 0.8 },
  dog_park: { ...B.outdoor, tags: ['hiking'], durationMin: 60 },
  // --- culture / attractions ---
  tourist_attraction: { ...B.act, tags: ['tours'], durationMin: 75, indoor: false, romantic: 0.6 },
  historical_landmark: { ...B.act, tags: ['tours'], durationMin: 60, indoor: false, romantic: 0.65 },
  historical_place: { ...B.act, tags: ['tours', 'museums'], durationMin: 75 },
  monument: { ...B.act, tags: ['tours'], durationMin: 45, indoor: false },
  museum: { ...B.act, tags: ['museums', 'tours'], durationMin: 90, energy: 0.2, social: 0.3, romantic: 0.6, price: 2, suited: { solo: 1, friends: 0.8, date: 0.85 } },
  art_gallery: { ...B.act, tags: ['museums'], durationMin: 75, energy: 0.2, social: 0.3, romantic: 0.85, price: 1, suited: { solo: 1, friends: 0.7, date: 0.95 } },
  planetarium: { ...B.act, tags: ['museums', 'tours'], durationMin: 90, romantic: 0.7, price: 2 },
  // --- entertainment ---
  movie_theater: { ...B.act, tags: ['movies'], dayparts: ['afternoon', 'evening'], durationMin: 130, energy: 0.2, social: 0.4, romantic: 0.7, price: 2 },
  performing_arts_theater: { ...B.act, tags: ['concerts', 'movies'], dayparts: ['evening'], durationMin: 150, energy: 0.3, social: 0.5, romantic: 0.85, price: 3 },
  concert_hall: { ...B.act, tags: ['concerts'], dayparts: ['evening'], durationMin: 150, social: 0.8, romantic: 0.7, price: 3 },
  amusement_park: { ...B.act, tags: ['thrill', 'arcade'], indoor: false, durationMin: 180, energy: 0.95, social: 0.8, romantic: 0.6, price: 3, suited: { solo: 0.5, friends: 1, date: 0.8 } },
  water_park: { ...B.act, tags: ['water', 'thrill'], indoor: false, durationMin: 180, energy: 0.9, social: 0.8, price: 3 },
  zoo: { ...B.act, tags: ['animals', 'hiking'], indoor: false, durationMin: 150, energy: 0.5, price: 3 },
  aquarium: { ...B.act, tags: ['animals', 'museums'], durationMin: 120, energy: 0.3, romantic: 0.7, price: 3 },
  bowling_alley: { ...B.act, tags: ['arcade', 'sports_play'], dayparts: ['afternoon', 'evening'], durationMin: 90, energy: 0.6, social: 0.9, romantic: 0.5, price: 2, suited: { solo: 0.4, friends: 1, date: 0.8 } },
  casino: { ...B.act, tags: ['nightlife', 'arcade'], dayparts: ['afternoon', 'evening'], durationMin: 120, energy: 0.6, social: 0.9, price: 2 },
  // --- wellness ---
  spa: { ...B.act, tags: ['wellness'], durationMin: 120, energy: 0.1, social: 0.2, romantic: 0.8, price: 3, suited: { solo: 1, friends: 0.7, date: 0.9 } },
  wellness_center: { ...B.act, tags: ['wellness'], durationMin: 90, energy: 0.2, romantic: 0.6, price: 2 },
  yoga_studio: { ...B.act, tags: ['wellness', 'classes'], durationMin: 75, energy: 0.5, price: 1 },
  // --- sports ---
  stadium: { ...B.act, tags: ['sports_watch'], dayparts: ['afternoon', 'evening'], durationMin: 180, indoor: false, energy: 0.7, social: 1, romantic: 0.4, price: 3, suited: { solo: 0.6, friends: 1, date: 0.6 } },
  arena: { ...B.act, tags: ['sports_watch'], dayparts: ['evening'], durationMin: 160, energy: 0.7, social: 1, romantic: 0.4, price: 3, suited: { solo: 0.6, friends: 1, date: 0.6 } },
  sports_complex: { ...B.act, tags: ['sports_play'], durationMin: 90, energy: 0.8, social: 0.7, price: 1 },
  sports_activity_location: { ...B.act, tags: ['sports_play'], durationMin: 90, energy: 0.8, social: 0.7, price: 1 },
  // --- shopping ---
  shopping_mall: { ...B.act, tags: ['shopping'], dayparts: ['afternoon', 'evening'], durationMin: 90, energy: 0.4, social: 0.6, romantic: 0.4, price: 1 },
  department_store: { ...B.act, tags: ['shopping'], durationMin: 60, price: 1 },
  market: { ...B.outdoor, tags: ['shopping', 'cafe', 'tours'], durationMin: 75, energy: 0.4, social: 0.7, price: 1, diet: ['vegetarian', 'vegan'] },
  book_store: { ...B.act, tags: ['shopping'], durationMin: 45, energy: 0.2, romantic: 0.6, price: 1 },
};

// Generic types only used as a last resort, so specific ones win.
const GENERIC_TYPES = new Set([
  'restaurant', 'food', 'bar', 'cafe', 'store', 'establishment',
  'point_of_interest', 'tourist_attraction',
]);

function attributesForTypes(primaryType, types) {
  const ordered = [primaryType, ...(types || [])].filter(Boolean);
  let generic = null;
  for (const t of ordered) {
    const m = TYPE_MAP[t];
    if (!m) continue;
    if (GENERIC_TYPES.has(t)) {
      if (!generic) generic = m;
      continue;
    }
    return m;
  }
  return generic;
}

export function mapPlaceToVenue(place, origin) {
  if (!place || !place.location) return null;
  if (place.businessStatus && place.businessStatus !== 'OPERATIONAL') return null;
  const attrs = attributesForTypes(place.primaryType, place.types);
  if (!attrs) return null;

  const lat = place.location.latitude;
  const lng = place.location.longitude;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;

  const distanceMi = Math.round(haversineMiles(origin, { lat, lng }) * 10) / 10;
  const price =
    place.priceLevel && PRICE_ENUM[place.priceLevel] != null
      ? PRICE_ENUM[place.priceLevel]
      : attrs.price ?? (attrs.kind === 'food' ? 2 : 1);
  const fallbackName = attrs.kind === 'food' ? 'A local spot' : 'A local activity';

  return {
    id: place.id,
    name: place.displayName?.text || fallbackName,
    kind: attrs.kind,
    tags: attrs.tags || [],
    price,
    durationMin: attrs.durationMin,
    suited: attrs.suited,
    energy: attrs.energy,
    social: attrs.social,
    indoor: attrs.indoor,
    romantic: attrs.romantic,
    meals: attrs.meals,
    dayparts: attrs.dayparts,
    diet: attrs.diet || [],
    rating: typeof place.rating === 'number' ? place.rating : undefined,
    lat,
    lng,
    distanceMi,
    mapUrl:
      place.googleMapsUri ||
      `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${place.id}`,
  };
}

async function nearby(key, includedTypes, center, radius) {
  const res = await fetch(NEARBY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.types,places.primaryType,places.priceLevel,places.location,places.rating,places.userRatingCount,places.businessStatus,places.googleMapsUri',
    },
    body: JSON.stringify({
      includedTypes,
      maxResultCount: 20,
      rankPreference: 'POPULARITY',
      locationRestriction: { circle: { center, radius } },
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Places API ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.places || [];
}

// Fetch a pool of real nearby venues. Returns [] if disabled; throws on hard API errors.
export async function fetchGooglePlaces(req) {
  const key = getApiKey();
  if (!key) return [];

  const center = { latitude: req.location.lat, longitude: req.location.lng };
  // Nearby Search circle radius is capped at 50km by Google.
  const radius = Math.min(Math.max(req.radiusMi, 1) * 1609.34, 50000);
  const want = `f${req.include.food ? 1 : 0}a${req.include.activities ? 1 : 0}`;
  const cacheKey = `${center.latitude.toFixed(2)},${center.longitude.toFixed(2)}|${Math.round(radius)}|${want}`;

  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.venues;

  const groups = [];
  if (req.include.food) {
    groups.push(['restaurant']);
    groups.push(['cafe', 'coffee_shop', 'bakery', 'dessert_shop', 'ice_cream_shop', 'bar', 'wine_bar', 'pub']);
  }
  if (req.include.activities) {
    groups.push([
      'tourist_attraction', 'museum', 'art_gallery', 'park', 'hiking_area',
      'amusement_park', 'zoo', 'aquarium', 'movie_theater', 'performing_arts_theater',
      'bowling_alley', 'spa', 'night_club', 'stadium', 'shopping_mall',
    ]);
  }

  const seen = new Map();
  for (const includedTypes of groups) {
    const places = await nearby(key, includedTypes, center, radius);
    for (const p of places) {
      const v = mapPlaceToVenue(p, req.location);
      if (v) seen.set(v.id, v);
    }
  }

  const venues = [...seen.values()];
  cache.set(cacheKey, { ts: Date.now(), venues });
  return venues;
}
