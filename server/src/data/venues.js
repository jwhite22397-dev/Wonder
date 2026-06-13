// A catalog of venue/activity templates. They are intentionally location-agnostic:
// at request time each one is "placed" at a deterministic pseudo-random point within
// the user's search radius (see engine/place.js). This lets Wonder generate believable
// itineraries for ANY location without a paid places API. Swap this module for a live
// data source (Google Places, Yelp, Ticketmaster, ...) to go to production.
//
// Fields:
//   kind:      'food' | 'activity'
//   tags:      interest tag ids from taxonomy.js (drives interest matching)
//   price:     0=free, 1=$, 2=$$, 3=$$$, 4=$$$$  (per person)
//   durationMin: typical time spent on site
//   suited:    multiplier 0..1 for how well it fits each mode
//   energy:    0 (relaxed) .. 1 (very active)
//   social:    0 (intimate/quiet) .. 1 (lively/loud)
//   indoor:    boolean
//   meals:     (food only) which slots it fills: breakfast|lunch|dinner|dessert|drinks
//   dayparts:  when it's open/best: morning|afternoon|evening
//   diet:      dietary ids this place reliably satisfies
//   romantic:  0..1 how romantic the setting is (boosts date mode)

export const VENUE_CATALOG = [
  // ---------------------------------------------------------------- CAFES / BREAKFAST
  { id: 'cafe-sunrise', name: 'Sunrise Coffee House', kind: 'food', tags: ['cafe'], price: 1, durationMin: 45, suited: { solo: 1, friends: 0.9, date: 0.8 }, energy: 0.2, social: 0.5, indoor: true, meals: ['breakfast', 'drinks'], dayparts: ['morning', 'afternoon'], diet: ['vegetarian'], romantic: 0.4 },
  { id: 'cafe-bakery', name: 'Flour & Honey Bakery', kind: 'food', tags: ['cafe', 'dessert'], price: 1, durationMin: 40, suited: { solo: 0.9, friends: 0.9, date: 0.8 }, energy: 0.2, social: 0.4, indoor: true, meals: ['breakfast', 'dessert'], dayparts: ['morning', 'afternoon'], diet: ['vegetarian'], romantic: 0.5 },
  { id: 'cafe-brunch', name: 'The Daily Brunch Co.', kind: 'food', tags: ['cafe', 'american'], price: 2, durationMin: 70, suited: { solo: 0.7, friends: 1, date: 0.9 }, energy: 0.3, social: 0.7, indoor: true, meals: ['breakfast', 'lunch'], dayparts: ['morning', 'afternoon'], diet: ['vegetarian'], romantic: 0.5 },

  // ---------------------------------------------------------------- RESTAURANTS
  { id: 'food-italian', name: 'Lantern & Vine Trattoria', kind: 'food', tags: ['italian'], price: 3, durationMin: 90, suited: { solo: 0.6, friends: 0.9, date: 1 }, energy: 0.3, social: 0.6, indoor: true, meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], diet: ['vegetarian'], romantic: 0.9 },
  { id: 'food-italian-casual', name: 'Nonna\u2019s Pizza Kitchen', kind: 'food', tags: ['italian'], price: 2, durationMin: 60, suited: { solo: 0.7, friends: 1, date: 0.7 }, energy: 0.4, social: 0.8, indoor: true, meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], diet: ['vegetarian'], romantic: 0.4 },
  { id: 'food-mexican', name: 'Casa Verde Cantina', kind: 'food', tags: ['mexican'], price: 2, durationMin: 75, suited: { solo: 0.6, friends: 1, date: 0.8 }, energy: 0.5, social: 0.9, indoor: true, meals: ['lunch', 'dinner', 'drinks'], dayparts: ['afternoon', 'evening'], diet: ['vegetarian'], romantic: 0.5 },
  { id: 'food-taqueria', name: 'El Sol Taqueria', kind: 'food', tags: ['mexican'], price: 1, durationMin: 45, suited: { solo: 0.9, friends: 1, date: 0.5 }, energy: 0.4, social: 0.7, indoor: true, meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], diet: ['vegetarian', 'gluten_free'], romantic: 0.2 },
  { id: 'food-sushi', name: 'Aoi Sushi & Sake', kind: 'food', tags: ['japanese', 'seafood'], price: 3, durationMin: 85, suited: { solo: 0.7, friends: 0.8, date: 1 }, energy: 0.3, social: 0.5, indoor: true, meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], diet: ['gluten_free'], romantic: 0.85 },
  { id: 'food-ramen', name: 'Komorebi Ramen Bar', kind: 'food', tags: ['japanese'], price: 2, durationMin: 55, suited: { solo: 1, friends: 0.9, date: 0.7 }, energy: 0.4, social: 0.6, indoor: true, meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], diet: [], romantic: 0.4 },
  { id: 'food-chinese', name: 'Golden Lotus Dim Sum', kind: 'food', tags: ['chinese'], price: 2, durationMin: 70, suited: { solo: 0.6, friends: 1, date: 0.7 }, energy: 0.4, social: 0.8, indoor: true, meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], diet: ['vegetarian'], romantic: 0.4 },
  { id: 'food-thai', name: 'Lemongrass Thai House', kind: 'food', tags: ['thai'], price: 2, durationMin: 70, suited: { solo: 0.7, friends: 0.9, date: 0.9 }, energy: 0.3, social: 0.6, indoor: true, meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], diet: ['vegetarian', 'vegan'], romantic: 0.6 },
  { id: 'food-indian', name: 'Saffron & Smoke', kind: 'food', tags: ['indian'], price: 2, durationMin: 80, suited: { solo: 0.6, friends: 1, date: 0.8 }, energy: 0.4, social: 0.7, indoor: true, meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], diet: ['vegetarian', 'vegan', 'halal'], romantic: 0.6 },
  { id: 'food-korean', name: 'Seoul Fire BBQ', kind: 'food', tags: ['korean'], price: 3, durationMin: 90, suited: { solo: 0.4, friends: 1, date: 0.8 }, energy: 0.6, social: 0.9, indoor: true, meals: ['dinner'], dayparts: ['evening'], diet: [], romantic: 0.5 },
  { id: 'food-medi', name: 'Olive Grove Mezze', kind: 'food', tags: ['mediterranean'], price: 2, durationMin: 80, suited: { solo: 0.6, friends: 1, date: 0.9 }, energy: 0.3, social: 0.6, indoor: true, meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], diet: ['vegetarian', 'vegan', 'halal'], romantic: 0.7 },
  { id: 'food-bbq', name: 'Hickory Lane Smokehouse', kind: 'food', tags: ['american'], price: 2, durationMin: 75, suited: { solo: 0.6, friends: 1, date: 0.6 }, energy: 0.5, social: 0.8, indoor: true, meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], diet: ['gluten_free'], romantic: 0.3 },
  { id: 'food-burger', name: 'Union Street Burgers', kind: 'food', tags: ['american'], price: 1, durationMin: 50, suited: { solo: 0.9, friends: 1, date: 0.5 }, energy: 0.5, social: 0.8, indoor: true, meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], diet: ['vegetarian'], romantic: 0.2 },
  { id: 'food-seafood', name: 'Harborlight Oyster Bar', kind: 'food', tags: ['seafood'], price: 3, durationMin: 90, suited: { solo: 0.5, friends: 0.8, date: 1 }, energy: 0.3, social: 0.6, indoor: true, meals: ['dinner'], dayparts: ['evening'], diet: ['gluten_free'], romantic: 0.9 },
  { id: 'food-vegan', name: 'Root & Bloom Kitchen', kind: 'food', tags: ['vegetarian_food'], price: 2, durationMin: 70, suited: { solo: 0.8, friends: 0.9, date: 0.9 }, energy: 0.3, social: 0.5, indoor: true, meals: ['lunch', 'dinner'], dayparts: ['afternoon', 'evening'], diet: ['vegetarian', 'vegan', 'gluten_free'], romantic: 0.6 },
  { id: 'food-tapas', name: 'Plaza Tapas & Wine', kind: 'food', tags: ['mediterranean', 'breweries'], price: 3, durationMin: 95, suited: { solo: 0.5, friends: 0.9, date: 1 }, energy: 0.4, social: 0.7, indoor: true, meals: ['dinner', 'drinks'], dayparts: ['evening'], diet: ['vegetarian'], romantic: 0.9 },
  { id: 'food-fine', name: 'The Conservatory (tasting menu)', kind: 'food', tags: ['american', 'seafood'], price: 4, durationMin: 120, suited: { solo: 0.3, friends: 0.5, date: 1 }, energy: 0.2, social: 0.4, indoor: true, meals: ['dinner'], dayparts: ['evening'], diet: ['vegetarian'], romantic: 1 },

  // ---------------------------------------------------------------- DESSERT / DRINKS
  { id: 'food-gelato', name: 'Luna Gelato', kind: 'food', tags: ['dessert'], price: 1, durationMin: 30, suited: { solo: 0.8, friends: 0.9, date: 1 }, energy: 0.2, social: 0.5, indoor: true, meals: ['dessert'], dayparts: ['afternoon', 'evening'], diet: ['vegetarian'], romantic: 0.8 },
  { id: 'food-dessertbar', name: 'Velvet Spoon Dessert Bar', kind: 'food', tags: ['dessert'], price: 2, durationMin: 45, suited: { solo: 0.6, friends: 0.8, date: 1 }, energy: 0.2, social: 0.5, indoor: true, meals: ['dessert'], dayparts: ['evening'], diet: ['vegetarian'], romantic: 0.9 },
  { id: 'food-rooftop', name: 'Altitude Rooftop Bar', kind: 'food', tags: ['breweries', 'nightlife'], price: 3, durationMin: 75, suited: { solo: 0.3, friends: 1, date: 0.9 }, energy: 0.5, social: 0.9, indoor: false, meals: ['drinks'], dayparts: ['evening'], diet: [], romantic: 0.8 },
  { id: 'food-brewery', name: 'Ironworks Brewing Co.', kind: 'food', tags: ['breweries'], price: 2, durationMin: 80, suited: { solo: 0.5, friends: 1, date: 0.6 }, energy: 0.6, social: 0.9, indoor: true, meals: ['drinks', 'dinner'], dayparts: ['evening'], diet: ['vegetarian'], romantic: 0.4 },
  { id: 'food-wine', name: 'Cellar 88 Wine Bar', kind: 'food', tags: ['breweries'], price: 3, durationMin: 75, suited: { solo: 0.4, friends: 0.8, date: 1 }, energy: 0.2, social: 0.5, indoor: true, meals: ['drinks'], dayparts: ['evening'], diet: ['vegetarian'], romantic: 0.95 },

  // ---------------------------------------------------------------- OUTDOORS
  { id: 'act-hike', name: 'Ridgeline Trail', kind: 'activity', tags: ['hiking', 'thrill'], price: 0, durationMin: 120, suited: { solo: 1, friends: 1, date: 0.9 }, energy: 0.9, social: 0.4, indoor: false, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.7 },
  { id: 'act-park', name: 'Willow Creek Park', kind: 'activity', tags: ['hiking'], price: 0, durationMin: 75, suited: { solo: 1, friends: 1, date: 1 }, energy: 0.5, social: 0.4, indoor: false, dayparts: ['morning', 'afternoon', 'evening'], diet: [], romantic: 0.7 },
  { id: 'act-botanical', name: 'Fernhollow Botanical Garden', kind: 'activity', tags: ['hiking', 'tours'], price: 1, durationMin: 90, suited: { solo: 0.9, friends: 0.8, date: 1 }, energy: 0.4, social: 0.3, indoor: false, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.95 },
  { id: 'act-kayak', name: 'Blue Heron Kayak Rentals', kind: 'activity', tags: ['water', 'thrill', 'hiking'], price: 2, durationMin: 120, suited: { solo: 0.8, friends: 1, date: 0.9 }, energy: 0.8, social: 0.5, indoor: false, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.7 },
  { id: 'act-beach', name: 'Crescent Bay Boardwalk', kind: 'activity', tags: ['water', 'tours'], price: 0, durationMin: 90, suited: { solo: 0.9, friends: 1, date: 1 }, energy: 0.5, social: 0.6, indoor: false, dayparts: ['morning', 'afternoon', 'evening'], diet: [], romantic: 0.85 },
  { id: 'act-bike', name: 'Greenway Bike Trail', kind: 'activity', tags: ['hiking', 'sports_play'], price: 1, durationMin: 90, suited: { solo: 1, friends: 1, date: 0.8 }, energy: 0.8, social: 0.4, indoor: false, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.6 },
  { id: 'act-climb', name: 'Summit Indoor Climbing Gym', kind: 'activity', tags: ['thrill', 'sports_play'], price: 2, durationMin: 90, suited: { solo: 0.8, friends: 1, date: 0.8 }, energy: 0.95, social: 0.6, indoor: true, dayparts: ['afternoon', 'evening'], diet: [], romantic: 0.5 },
  { id: 'act-zipline', name: 'Canopy Zipline Adventure', kind: 'activity', tags: ['thrill', 'hiking'], price: 3, durationMin: 150, suited: { solo: 0.6, friends: 1, date: 0.8 }, energy: 1, social: 0.7, indoor: false, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.6 },

  // ---------------------------------------------------------------- CULTURE
  { id: 'act-art', name: 'Meridian Museum of Art', kind: 'activity', tags: ['museums', 'tours'], price: 2, durationMin: 90, suited: { solo: 1, friends: 0.8, date: 1 }, energy: 0.2, social: 0.3, indoor: true, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.8 },
  { id: 'act-science', name: 'Discovery Science Center', kind: 'activity', tags: ['museums', 'classes'], price: 2, durationMin: 120, suited: { solo: 0.8, friends: 1, date: 0.7 }, energy: 0.4, social: 0.6, indoor: true, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.4 },
  { id: 'act-history', name: 'Old Town History Museum', kind: 'activity', tags: ['museums', 'tours'], price: 1, durationMin: 75, suited: { solo: 1, friends: 0.7, date: 0.7 }, energy: 0.2, social: 0.3, indoor: true, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.5 },
  { id: 'act-walktour', name: 'Historic Old Town Walking Tour', kind: 'activity', tags: ['tours', 'hiking'], price: 1, durationMin: 90, suited: { solo: 0.9, friends: 0.9, date: 0.9 }, energy: 0.5, social: 0.5, indoor: false, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.7 },
  { id: 'act-foodtour', name: 'Tastes of the City Food Tour', kind: 'activity', tags: ['tours', 'cafe'], price: 3, durationMin: 150, suited: { solo: 0.7, friends: 1, date: 0.9 }, energy: 0.5, social: 0.8, indoor: false, dayparts: ['afternoon'], diet: ['vegetarian'], romantic: 0.7 },
  { id: 'act-aquarium', name: 'Tidewater Aquarium', kind: 'activity', tags: ['animals', 'museums'], price: 3, durationMin: 120, suited: { solo: 0.7, friends: 0.9, date: 1 }, energy: 0.3, social: 0.5, indoor: true, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.7 },
  { id: 'act-zoo', name: 'Cedar Hills Zoo', kind: 'activity', tags: ['animals', 'hiking'], price: 3, durationMin: 150, suited: { solo: 0.7, friends: 1, date: 0.8 }, energy: 0.5, social: 0.6, indoor: false, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.5 },

  // ---------------------------------------------------------------- ENTERTAINMENT
  { id: 'act-concert', name: 'The Mercury Live Music Hall', kind: 'activity', tags: ['concerts', 'nightlife'], price: 3, durationMin: 150, suited: { solo: 0.5, friends: 1, date: 0.9 }, energy: 0.7, social: 1, indoor: true, dayparts: ['evening'], diet: [], romantic: 0.6 },
  { id: 'act-jazz', name: 'Blue Note Jazz Lounge', kind: 'activity', tags: ['concerts', 'nightlife'], price: 2, durationMin: 120, suited: { solo: 0.6, friends: 0.8, date: 1 }, energy: 0.3, social: 0.6, indoor: true, dayparts: ['evening'], diet: [], romantic: 0.95 },
  { id: 'act-comedy', name: 'Punchline Comedy Club', kind: 'activity', tags: ['comedy', 'nightlife'], price: 2, durationMin: 120, suited: { solo: 0.5, friends: 1, date: 0.9 }, energy: 0.5, social: 0.9, indoor: true, dayparts: ['evening'], diet: [], romantic: 0.6 },
  { id: 'act-theater', name: 'Royale Theater (live show)', kind: 'activity', tags: ['movies', 'concerts'], price: 3, durationMin: 150, suited: { solo: 0.6, friends: 0.8, date: 1 }, energy: 0.3, social: 0.5, indoor: true, dayparts: ['evening'], diet: [], romantic: 0.85 },
  { id: 'act-cinema', name: 'Starlight Cinema', kind: 'activity', tags: ['movies'], price: 2, durationMin: 130, suited: { solo: 0.8, friends: 0.9, date: 0.9 }, energy: 0.2, social: 0.4, indoor: true, dayparts: ['afternoon', 'evening'], diet: [], romantic: 0.7 },
  { id: 'act-game', name: 'Pinball & Pints Arcade', kind: 'activity', tags: ['arcade', 'nightlife'], price: 2, durationMin: 90, suited: { solo: 0.5, friends: 1, date: 0.8 }, energy: 0.7, social: 0.9, indoor: true, dayparts: ['afternoon', 'evening'], diet: [], romantic: 0.5 },
  { id: 'act-bowling', name: 'Strike Lanes Bowling', kind: 'activity', tags: ['arcade', 'sports_play'], price: 2, durationMin: 90, suited: { solo: 0.4, friends: 1, date: 0.8 }, energy: 0.6, social: 0.9, indoor: true, dayparts: ['afternoon', 'evening'], diet: [], romantic: 0.5 },
  { id: 'act-mini', name: 'Glow Mini Golf', kind: 'activity', tags: ['arcade', 'sports_play'], price: 1, durationMin: 75, suited: { solo: 0.4, friends: 1, date: 0.9 }, energy: 0.5, social: 0.8, indoor: true, dayparts: ['afternoon', 'evening'], diet: [], romantic: 0.7 },
  { id: 'act-escape', name: 'Cipher Escape Rooms', kind: 'activity', tags: ['arcade', 'classes'], price: 2, durationMin: 75, suited: { solo: 0.3, friends: 1, date: 0.8 }, energy: 0.6, social: 0.8, indoor: true, dayparts: ['afternoon', 'evening'], diet: [], romantic: 0.6 },
  { id: 'act-karaoke', name: 'Encore Karaoke Rooms', kind: 'activity', tags: ['nightlife', 'concerts'], price: 2, durationMin: 90, suited: { solo: 0.2, friends: 1, date: 0.7 }, energy: 0.7, social: 1, indoor: true, dayparts: ['evening'], diet: [], romantic: 0.5 },

  // ---------------------------------------------------------------- SPORTS
  { id: 'act-stadium', name: 'Riverside Stadium (live game)', kind: 'activity', tags: ['sports_watch'], price: 3, durationMin: 180, suited: { solo: 0.6, friends: 1, date: 0.7 }, energy: 0.7, social: 1, indoor: false, dayparts: ['afternoon', 'evening'], diet: [], romantic: 0.4 },
  { id: 'act-arena', name: 'Downtown Arena (live game)', kind: 'activity', tags: ['sports_watch'], price: 3, durationMin: 160, suited: { solo: 0.6, friends: 1, date: 0.7 }, energy: 0.7, social: 1, indoor: true, dayparts: ['evening'], diet: [], romantic: 0.4 },
  { id: 'act-sportsbar', name: 'Overtime Sports Bar', kind: 'food', tags: ['sports_watch', 'american', 'nightlife'], price: 2, durationMin: 90, suited: { solo: 0.6, friends: 1, date: 0.4 }, energy: 0.6, social: 1, indoor: true, meals: ['lunch', 'dinner', 'drinks'], dayparts: ['afternoon', 'evening'], diet: [], romantic: 0.2 },
  { id: 'act-tennis', name: 'Baseline Tennis Courts', kind: 'activity', tags: ['sports_play'], price: 1, durationMin: 75, suited: { solo: 0.5, friends: 1, date: 0.7 }, energy: 0.9, social: 0.6, indoor: false, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.4 },
  { id: 'act-golf', name: 'Fairview Driving Range', kind: 'activity', tags: ['sports_play'], price: 2, durationMin: 90, suited: { solo: 0.7, friends: 1, date: 0.7 }, energy: 0.5, social: 0.6, indoor: false, dayparts: ['morning', 'afternoon', 'evening'], diet: [], romantic: 0.5 },

  // ---------------------------------------------------------------- WELLNESS / SHOPPING / CLASSES
  { id: 'act-spa', name: 'Stillwater Day Spa', kind: 'activity', tags: ['wellness'], price: 3, durationMin: 120, suited: { solo: 1, friends: 0.7, date: 0.9 }, energy: 0.1, social: 0.2, indoor: true, dayparts: ['morning', 'afternoon'], diet: [], romantic: 0.8 },
  { id: 'act-yoga', name: 'Lotus Flow Yoga Studio', kind: 'activity', tags: ['wellness', 'classes'], price: 1, durationMin: 75, suited: { solo: 1, friends: 0.8, date: 0.7 }, energy: 0.5, social: 0.4, indoor: true, dayparts: ['morning', 'evening'], diet: [], romantic: 0.4 },
  { id: 'act-market', name: 'Riverside Farmers Market', kind: 'activity', tags: ['shopping', 'cafe', 'tours'], price: 1, durationMin: 75, suited: { solo: 0.9, friends: 1, date: 0.9 }, energy: 0.4, social: 0.7, indoor: false, dayparts: ['morning', 'afternoon'], diet: ['vegetarian', 'vegan'], romantic: 0.6 },
  { id: 'act-shopping', name: 'The Promenade Shops', kind: 'activity', tags: ['shopping'], price: 1, durationMin: 90, suited: { solo: 0.8, friends: 1, date: 0.7 }, energy: 0.4, social: 0.6, indoor: false, dayparts: ['afternoon', 'evening'], diet: [], romantic: 0.4 },
  { id: 'act-pottery', name: 'Clay & Co. Pottery Class', kind: 'activity', tags: ['classes', 'wellness'], price: 2, durationMin: 120, suited: { solo: 0.7, friends: 0.9, date: 1 }, energy: 0.4, social: 0.6, indoor: true, dayparts: ['afternoon', 'evening'], diet: [], romantic: 0.8 },
  { id: 'act-cooking', name: 'The Open Flame Cooking Class', kind: 'activity', tags: ['classes', 'cafe'], price: 3, durationMin: 150, suited: { solo: 0.6, friends: 0.9, date: 1 }, energy: 0.4, social: 0.7, indoor: true, dayparts: ['evening'], diet: ['vegetarian'], romantic: 0.85 },
  { id: 'act-paint', name: 'Canvas & Cork Paint Night', kind: 'activity', tags: ['classes', 'breweries'], price: 2, durationMin: 120, suited: { solo: 0.6, friends: 1, date: 0.9 }, energy: 0.3, social: 0.8, indoor: true, dayparts: ['evening'], diet: [], romantic: 0.75 },
];

export default VENUE_CATALOG;
