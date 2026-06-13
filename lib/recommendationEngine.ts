import {
  ActivityCategory,
  BudgetLevel,
  FoodCategory,
  Itinerary,
  ItineraryStop,
  PlanMode,
  PlanRequest,
  UserProfile,
  Venue,
} from './types';
import { budgetWithinLimit, haversineMiles, localizeVenues } from './venues';

const BUDGET_ESTIMATES: Record<BudgetLevel, number> = {
  budget: 25,
  moderate: 45,
  upscale: 85,
  splurge: 150,
};

const MODE_BONUS: Record<PlanMode, Partial<Record<string, number>>> = {
  solo: { cozy: 2, creative: 2, peaceful: 2 },
  friends: { social: 3, lively: 2, group: 3, fun: 2 },
  date: { romantic: 4, 'date-night': 3, scenic: 2, special: 2 },
};

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h % 12 || 12;
  return `${display}:${m.toString().padStart(2, '0')} ${period}`;
}

function scoreVenue(
  venue: Venue,
  profiles: UserProfile[],
  mode: PlanMode,
  maxBudget: BudgetLevel,
  originLat: number,
  originLng: number,
  radiusMiles: number
): number {
  if (!venue.modes.includes(mode)) return -1;
  if (!budgetWithinLimit(venue.priceLevel, maxBudget)) return -1;

  const distance = haversineMiles(originLat, originLng, venue.lat, venue.lng);
  if (distance > radiusMiles) return -1;

  let score = venue.rating * 10;

  for (const profile of profiles) {
    if (venue.type === 'activity') {
      if (profile.interests.includes(venue.category as ActivityCategory)) score += 15;
    } else {
      if (profile.foodPreferences.includes(venue.category as FoodCategory)) score += 15;
    }

    if (profile.energyLevel === 'active' && venue.tags.includes('active')) score += 3;
    if (profile.energyLevel === 'relaxed' && venue.tags.includes('relaxed')) score += 3;
    if (profile.energyLevel === 'relaxed' && venue.tags.includes('peaceful')) score += 3;
  }

  const modeTags = MODE_BONUS[mode];
  for (const tag of venue.tags) {
    if (modeTags[tag]) score += modeTags[tag]!;
  }

  score -= distance * 0.3;
  score += Math.random() * 4;

  return score;
}

function pickVenues(
  pool: Venue[],
  count: number,
  usedIds: Set<string>,
  minScore: number
): Venue[] {
  const available = pool
    .filter((v) => !usedIds.has(v.id))
    .sort((a, b) => b.rating - a.rating);

  const picked: Venue[] = [];
  for (const venue of available) {
    if (picked.length >= count) break;
    picked.push(venue);
  }
  return picked.length >= minScore ? picked : available.slice(0, count);
}

function buildStops(
  activities: Venue[],
  foods: Venue[],
  startMinutes: number,
  durationMinutes: number,
  includeFood: boolean,
  includeActivities: boolean
): ItineraryStop[] {
  const stops: ItineraryStop[] = [];
  let cursor = startMinutes;
  const end = startMinutes + durationMinutes;

  const foodSlots: { minHour: number; maxHour: number; label: string }[] = [
    { minHour: 7, maxHour: 11, label: 'Start with coffee or brunch' },
    { minHour: 11, maxHour: 14, label: 'Grab lunch' },
    { minHour: 17, maxHour: 21, label: 'Dinner time' },
  ];

  let activityIdx = 0;
  let foodIdx = 0;

  if (includeFood && foods.length > 0) {
    const startHour = Math.floor(startMinutes / 60);
    const slot = foodSlots.find((s) => startHour >= s.minHour && startHour < s.maxHour) ?? foodSlots[0];
    stops.push({
      time: formatTime(cursor),
      venue: foods[foodIdx % foods.length],
      note: slot.label,
    });
    cursor += foods[foodIdx % foods.length].durationMinutes;
    foodIdx++;
  }

  while (cursor < end - 30 && activityIdx < activities.length && includeActivities) {
    const activity = activities[activityIdx % activities.length];
    if (cursor + activity.durationMinutes > end) break;
    stops.push({
      time: formatTime(cursor),
      venue: activity,
    });
    cursor += activity.durationMinutes;
    activityIdx++;

    const hour = Math.floor(cursor / 60);
    const needsFood =
      includeFood &&
      foodIdx < foods.length &&
      foodSlots.some((s) => hour >= s.minHour && hour < s.maxHour && cursor + 45 <= end);

    if (needsFood) {
      const food = foods[foodIdx % foods.length];
      stops.push({
        time: formatTime(cursor),
        venue: food,
        note: hour >= 17 ? 'Evening bites' : 'Refuel',
      });
      cursor += food.durationMinutes;
      foodIdx++;
    }
  }

  if (includeFood && foods.length > 0 && stops.length > 0) {
    const lastStop = stops[stops.length - 1];
    if (lastStop.venue.type !== 'food' && cursor + 30 <= end) {
      stops.push({
        time: formatTime(cursor),
        venue: foods[foodIdx % foods.length],
        note: 'Sweet ending',
      });
    }
  }

  return stops;
}

function estimateCost(stops: ItineraryStop[], participantCount: number): string {
  const perPerson = stops.reduce((sum, s) => sum + BUDGET_ESTIMATES[s.venue.priceLevel], 0);
  const totalLow = Math.round(perPerson * participantCount * 0.8);
  const totalHigh = Math.round(perPerson * participantCount * 1.2);
  return `$${totalLow}–$${totalHigh} total`;
}

const ITINERARY_THEMES = [
  { title: 'The Classic Explorer', subtitle: 'A balanced mix of culture and cuisine' },
  { title: 'Adventure & Appetites', subtitle: 'Active vibes with great food stops' },
  { title: 'Slow & Sweet', subtitle: 'Relaxed pacing with memorable moments' },
];

function generateTitle(mode: PlanMode, stops: ItineraryStop[], themeIndex: number): string {
  const theme = ITINERARY_THEMES[themeIndex % ITINERARY_THEMES.length];
  if (mode === 'date') return `${theme.title} 💕`;
  if (mode === 'friends') return `${theme.title} 🎉`;
  return `${theme.title} ✨`;
}

export function generateItineraries(
  request: PlanRequest,
  profiles: UserProfile[]
): Itinerary[] {
  const venues = localizeVenues(
    request.location.latitude,
    request.location.longitude,
    request.radiusMiles
  );

  const scoredActivities = venues
    .filter((v) => v.type === 'activity')
    .map((v) => ({
      venue: v,
      score: scoreVenue(
        v,
        profiles,
        request.mode,
        request.budget,
        request.location.latitude,
        request.location.longitude,
        request.radiusMiles
      ),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const scoredFood = venues
    .filter((v) => v.type === 'food')
    .map((v) => ({
      venue: v,
      score: scoreVenue(
        v,
        profiles,
        request.mode,
        request.budget,
        request.location.latitude,
        request.location.longitude,
        request.radiusMiles
      ),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const startMinutes = parseTime(request.startTime);
  const durationMinutes = request.durationHours * 60;
  const itineraries: Itinerary[] = [];

  for (let i = 0; i < 3; i++) {
    const activityOffset = i * 2;
    const foodOffset = i * 2;

    const activities = scoredActivities
      .slice(activityOffset, activityOffset + 4)
      .map((s) => s.venue);

    const foods = scoredFood.slice(foodOffset, foodOffset + 3).map((s) => s.venue);

    const fallbackActivities = venues.filter((v) => v.type === 'activity' && v.modes.includes(request.mode));
    const fallbackFood = venues.filter((v) => v.type === 'food' && v.modes.includes(request.mode));

    const usedActivities =
      activities.length >= 2
        ? activities
        : pickVenues(fallbackActivities, 3, new Set(), 1);

    const usedFood =
      foods.length >= 1 ? foods : pickVenues(fallbackFood, 2, new Set(), 1);

    const stops = buildStops(
      usedActivities,
      usedFood,
      startMinutes,
      durationMinutes,
      request.includeFood,
      request.includeActivities
    );

    if (stops.length === 0) continue;

    const theme = ITINERARY_THEMES[i];
    const totalDuration = stops.reduce((sum, s) => sum + s.venue.durationMinutes, 0);
    const highlights = stops.slice(0, 3).map((s) => s.venue.name);
    const avgScore =
      stops.reduce((sum, s) => {
        const pool = s.venue.type === 'activity' ? scoredActivities : scoredFood;
        const match = pool.find((p) => p.venue.id === s.venue.id);
        return sum + (match?.score ?? s.venue.rating * 10);
      }, 0) / stops.length;

    itineraries.push({
      id: `itin_${Date.now()}_${i}`,
      title: generateTitle(request.mode, stops, i),
      subtitle: theme.subtitle,
      totalCostEstimate: estimateCost(stops, profiles.length || 1),
      totalDurationMinutes: totalDuration,
      stops,
      score: avgScore,
      highlights,
    });
  }

  return itineraries.sort((a, b) => b.score - a.score);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
