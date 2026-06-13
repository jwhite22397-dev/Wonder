import VENUE_CATALOG from '../data/venues.js';
import { haversineMiles, makeRng, placeVenue } from './geo.js';
import { scoreVenue, mergeProfiles, costForVenue, priceLabel } from './scoring.js';

// ---- time helpers -----------------------------------------------------------
function toMinutes(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
function fmtTime(mins) {
  let h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  let hh = h % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
}
function daypartFromHour(hour) {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
function mealFromHour(hour) {
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  if (hour >= 16 && hour < 22) return 'dinner';
  return null;
}
function travelMinutes(distMi) {
  return Math.round((distMi || 0) * 2.5) + 5;
}

function mealMatch(venue, meal) {
  if (meal === 'any') return true;
  if (meal === 'dessert') return venue.meals?.includes('dessert') || venue.meals?.includes('drinks');
  return venue.meals?.includes(meal);
}

const VARIANTS = [
  {
    key: 'balanced',
    variant: 'balanced',
    title: 'The Crowd-Pleaser',
    blurb: 'A well-rounded plan balancing your top interests.',
    emoji: '\u2728',
  },
  {
    key: 'adventurous',
    variant: 'adventurous',
    title: 'The Adventure',
    blurb: 'Higher energy, more to see and do.',
    emoji: '\u{1F525}',
  },
  {
    key: 'cozy',
    variant: 'cozy',
    title: 'The Cozy One',
    blurb: 'Relaxed, low-key, and easy-going.',
    emoji: '\u{1F343}',
  },
];

// Build the placed, in-radius candidate pool for this request.
function buildPool(req) {
  const seed = `${req.location.lat.toFixed(3)},${req.location.lng.toFixed(3)}|${req.date || ''}`;
  const rng = makeRng(seed);
  const pool = [];
  for (const tpl of VENUE_CATALOG) {
    const placed = placeVenue(tpl, req.location, req.radiusMi, rng);
    if (placed.distanceMi <= req.radiusMi + 0.01) pool.push(placed);
  }
  return pool;
}

function passesFilters(venue, req, merged) {
  // category include flags
  if (venue.kind === 'food' && !req.include.food) return false;
  if (venue.kind === 'activity' && !req.include.activities) return false;
  // no-alcohol: drop alcohol-forward spots
  if (merged.dietary.includes('no_alcohol')) {
    const alcoholy =
      venue.tags.includes('breweries') ||
      venue.tags.includes('nightlife') ||
      (venue.meals && venue.meals.length === 1 && venue.meals[0] === 'drinks');
    if (alcoholy) return false;
  }
  return true;
}

function buildItinerary(req, pool, merged, profiles, variantCfg, globalUsed) {
  const start = toMinutes(req.startTime);
  const end = toMinutes(req.endTime);
  const budget = req.budgetPerPerson;
  const maxStops = 5;

  const localUsed = new Set();
  const stops = [];
  const mealsDone = new Set();
  let cursor = start;
  let spent = 0;
  let prevCoord = req.location;

  // estimate remaining slots for a per-stop budget hint
  const approxSlots = Math.max(2, Math.min(maxStops, Math.round((end - start) / 90)));

  while (cursor < end - 20 && stops.length < maxStops) {
    const hour = Math.floor(cursor / 60);
    const daypart = daypartFromHour(hour);

    // decide what kind of stop to look for
    let want = null;
    if (req.include.food) {
      const meal = mealFromHour(hour);
      if (meal && !mealsDone.has(meal)) want = { kind: 'food', meal };
      else if (hour >= 18 && !mealsDone.has('dessert') && (mealsDone.has('dinner') || !req.include.activities))
        want = { kind: 'food', meal: 'dessert' };
    }
    if (!want && req.include.activities) want = { kind: 'activity' };
    if (!want && req.include.food) want = { kind: 'food', meal: 'any' };
    if (!want) break;

    const remainingBudget = budget - spent;
    const slotsLeft = Math.max(1, approxSlots - stops.length);
    const budgetPerStop = remainingBudget / slotsLeft;

    let usedWant = want;
    let stop = pickBest({
      pool, req, merged, profiles, want, daypart,
      variant: variantCfg.variant, localUsed, globalUsed, remainingBudget, budgetPerStop,
    });

    if (!stop) {
      // try the alternate kind once before giving up this iteration
      const altKind = want.kind === 'food' ? 'activity' : 'food';
      const altAllowed = altKind === 'food' ? req.include.food : req.include.activities;
      usedWant = { kind: altKind, meal: altKind === 'food' ? 'any' : undefined };
      stop = altAllowed
        ? pickBest({
            pool, req, merged, profiles, want: usedWant, daypart,
            variant: variantCfg.variant, localUsed, globalUsed, remainingBudget, budgetPerStop,
          })
        : null;
      if (!stop) break;
    }

    const s = stop;
    const travel = stops.length === 0
      ? travelMinutes(s.venue.distanceMi)
      : travelMinutes(haversineMiles(prevCoord, s.venue));
    const arrive = cursor + (stops.length === 0 ? 0 : travel);
    const leave = arrive + s.venue.durationMin;
    const isFood = s.venue.kind === 'food';
    // The meal we set out to fill (for bookkeeping) vs. the label we show the user.
    const slotMeal = isFood
      ? (usedWant.meal && usedWant.meal !== 'any' ? usedWant.meal : (mealFromHour(Math.floor(arrive / 60)) || 'dessert'))
      : null;
    let mealLabel = slotMeal;
    if (mealLabel === 'dessert' && !s.venue.meals?.includes('dessert') && s.venue.meals?.includes('drinks')) {
      mealLabel = 'drinks';
    }

    stops.push({
      id: s.venue.id,
      name: s.venue.name,
      kind: s.venue.kind,
      meal: mealLabel,
      tags: s.venue.tags,
      priceLevel: s.venue.price,
      priceLabel: priceLabel(s.venue.price),
      costPerPerson: s.cost,
      durationMin: s.venue.durationMin,
      distanceMi: s.venue.distanceMi,
      lat: s.venue.lat,
      lng: s.venue.lng,
      indoor: s.venue.indoor,
      startTime: fmtTime(arrive),
      endTime: fmtTime(leave),
      travelFromPrevMin: stops.length === 0 ? null : travel,
      reasons: ensureReasons(s.reasons, s.venue, mealLabel),
      mapUrl: `https://www.google.com/maps/search/?api=1&query=${s.venue.lat},${s.venue.lng}`,
    });
    spent += s.cost;
    cursor = leave;
    localUsed.add(s.venue.id);
    globalUsed.add(s.venue.id);
    if (isFood && slotMeal) mealsDone.add(slotMeal);
    prevCoord = s.venue;
  }

  if (stops.length === 0) return null;

  const totalCost = stops.reduce((a, s) => a + s.costPerPerson, 0);
  const maxDist = Math.max(...stops.map((s) => s.distanceMi));
  const totalMin = stops.reduce((a, s) => a + s.durationMin + (s.travelFromPrevMin || 0), 0);

  return {
    key: variantCfg.key,
    title: variantCfg.title,
    blurb: variantCfg.blurb,
    emoji: variantCfg.emoji,
    stops,
    summary: {
      stopCount: stops.length,
      estCostPerPerson: Math.round(totalCost),
      estCostTotal: Math.round(totalCost * merged.count),
      maxDistanceMi: Math.round(maxDist * 10) / 10,
      totalMinutes: totalMin,
      withinBudget: totalCost <= budget,
    },
    directionsUrl: buildDirectionsUrl(req.location, stops),
  };
}

// Guarantee each stop carries at least one human-friendly reason.
function ensureReasons(reasons, venue, mealLabel) {
  if (reasons && reasons.length) return reasons;
  if (venue.kind === 'food') {
    const meal = mealLabel && mealLabel !== 'bite' ? mealLabel : 'a bite';
    return [`a solid spot for ${meal}`];
  }
  return ['a fun way to spend the time'];
}

function pickBest(ctx) {
  const { pool, req, merged, profiles, want, daypart, variant, localUsed, globalUsed, remainingBudget, budgetPerStop } = ctx;
  let best = null;
  for (const venue of pool) {
    if (venue.kind !== want.kind) continue;
    if (localUsed.has(venue.id)) continue;
    if (!passesFilters(venue, req, merged)) continue;
    if (venue.dayparts && !venue.dayparts.includes(daypart)) continue;
    if (want.kind === 'food' && !mealMatch(venue, want.meal || 'any')) continue;

    const cost = costForVenue(venue);
    // budget gate: never blow the remaining budget (allow free venues always)
    if (cost > remainingBudget && cost > 0) continue;

    const { score, reasons } = scoreVenue({
      profiles,
      merged,
      venue,
      mode: req.mode,
      variant,
      budgetPerStop,
    });

    let adj = score;
    // diversify across the three itineraries
    if (globalUsed.has(venue.id)) adj -= 0.3;
    // adventurous wants energy; cozy wants calm
    if (variant === 'adventurous') adj += venue.energy * 0.08;
    if (variant === 'cozy') adj += (1 - venue.energy) * 0.08;

    if (!best || adj > best.adj) best = { venue, score: adj, adj, reasons, cost };
  }
  return best;
}

function buildDirectionsUrl(origin, stops) {
  if (!stops.length) return null;
  const waypoints = stops.map((s) => `${s.lat},${s.lng}`);
  const destination = waypoints[waypoints.length - 1];
  const mids = waypoints.slice(0, -1).join('|');
  let url = `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination}&travelmode=driving`;
  if (mids) url += `&waypoints=${encodeURIComponent(mids)}`;
  return url;
}

// ---- public API -------------------------------------------------------------
export function generateItineraries(req, profiles) {
  const merged = mergeProfiles(profiles);
  const pool = buildPool(req);
  const globalUsed = new Set();

  const results = [];
  for (const cfg of VARIANTS) {
    const it = buildItinerary(req, pool, merged, profiles, cfg, globalUsed);
    if (it) results.push(it);
  }

  // If diversification starved later variants, retry them without the global-used penalty.
  if (results.length < 3) {
    for (const cfg of VARIANTS) {
      if (results.find((r) => r.key === cfg.key)) continue;
      const it = buildItinerary(req, pool, merged, profiles, cfg, new Set());
      if (it) results.push(it);
    }
  }

  return results;
}

export { fmtTime, toMinutes };
