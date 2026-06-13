import { CITIES } from '../data/cities';
import { VENUES } from '../data/venues';
import { ItineraryOption, PlannerRequest, ScoredVenue, UserProfile, Venue } from '../types';

function toRadians(degree: number): number {
  return (degree * Math.PI) / 180;
}

function distanceMiles(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function scoreVenue(
  venue: Venue,
  request: PlannerRequest,
  participants: UserProfile[],
  distance: number,
): ScoredVenue {
  const allInterestTags = uniqueStrings(participants.flatMap((p) => p.interests));
  const allFoodTags = uniqueStrings(participants.flatMap((p) => p.foodInterests));

  const interestMatches = venue.tags.filter((tag) => allInterestTags.includes(tag));
  const foodMatches = venue.foodTags.filter((tag) => allFoodTags.includes(tag));
  const matchedTags = uniqueStrings([...interestMatches, ...foodMatches]);

  const availabilityCount = participants.filter(
    (participant) =>
      participant.availability.preferredDayTypes.includes(request.dayType) &&
      participant.availability.preferredTimeSlots.includes(request.timeSlot),
  ).length;

  const distanceRatio = Math.max(0, 1 - distance / Math.max(request.maxDriveMiles, 1));
  const budgetRatio = Math.max(0, 1 - venue.costPerPerson / Math.max(request.budgetPerPerson, 1));

  let score = 0;
  score += matchedTags.length * 7;
  score += venue.suitableModes.includes(request.mode) ? 8 : -6;
  score += availabilityCount * 4;
  score += distanceRatio * 8;
  score += budgetRatio * 6;

  if (request.mode === 'date' && venue.kind === 'food') {
    score += 2;
  }

  if (request.mode === 'solo' && venue.kind === 'activity') {
    score += 2;
  }

  return { venue, score, distanceMiles: distance, matchedTags };
}

function createItinerary(
  stops: ScoredVenue[],
  bonusScore: number,
  summaryPrefix: string,
): ItineraryOption {
  const totalCostPerPerson = stops.reduce((sum, stop) => sum + stop.venue.costPerPerson, 0);
  const estimatedDriveMiles = Math.max(...stops.map((stop) => stop.distanceMiles));
  const score = stops.reduce((sum, stop) => sum + stop.score, 0) + bonusScore;
  const matched = uniqueStrings(stops.flatMap((stop) => stop.matchedTags));
  const summary =
    `${summaryPrefix} Best matches: ${matched.slice(0, 4).join(', ') || 'balanced preferences'}.`;

  return {
    id: stops.map((stop) => stop.venue.id).join('__'),
    title: stops.map((stop) => stop.venue.title).join(' + '),
    summary,
    totalCostPerPerson,
    estimatedDriveMiles,
    score,
    stops,
  };
}

export function generateItineraryOptions(
  request: PlannerRequest,
  profiles: UserProfile[],
): ItineraryOption[] {
  const participants = profiles.filter((profile) => request.participantIds.includes(profile.id));
  if (participants.length === 0) {
    return [];
  }

  const city = CITIES.find((entry) => entry.id === request.cityId);
  if (!city) {
    return [];
  }

  const consideredVenues = VENUES.filter((venue) => {
    if (venue.cityId !== request.cityId) {
      return false;
    }
    if (!venue.dayTypes.includes(request.dayType) || !venue.timeSlots.includes(request.timeSlot)) {
      return false;
    }
    if (!request.includeFood && venue.kind === 'food') {
      return false;
    }
    if (!request.includeActivities && venue.kind === 'activity') {
      return false;
    }
    if (venue.costPerPerson > request.budgetPerPerson * 1.5) {
      return false;
    }

    const distance = distanceMiles(city.lat, city.lng, venue.lat, venue.lng);
    return distance <= request.maxDriveMiles;
  });

  const scored = consideredVenues
    .map((venue) => {
      const distance = distanceMiles(city.lat, city.lng, venue.lat, venue.lng);
      return scoreVenue(venue, request, participants, distance);
    })
    .sort((left, right) => right.score - left.score);

  if (scored.length === 0) {
    return [];
  }

  const topActivities = scored.filter((item) => item.venue.kind === 'activity').slice(0, 6);
  const topFoods = scored.filter((item) => item.venue.kind === 'food').slice(0, 6);

  const candidates: ItineraryOption[] = [];

  if (request.includeActivities && request.includeFood) {
    for (const activity of topActivities) {
      for (const food of topFoods) {
        const totalCost = activity.venue.costPerPerson + food.venue.costPerPerson;
        if (totalCost > request.budgetPerPerson * 1.8) {
          continue;
        }
        candidates.push(
          createItinerary(
            [activity, food],
            6,
            `Start with ${activity.venue.kind}, then transition to ${food.venue.kind}.`,
          ),
        );
      }
    }
  }

  if (request.includeActivities) {
    for (let index = 0; index < topActivities.length; index += 1) {
      candidates.push(
        createItinerary([topActivities[index]], 2, 'Single activity-focused plan.'),
      );
      const next = topActivities[index + 1];
      if (next) {
        candidates.push(
          createItinerary(
            [topActivities[index], next],
            4,
            'Two-stop activity itinerary with variety.',
          ),
        );
      }
    }
  }

  if (request.includeFood) {
    for (let index = 0; index < topFoods.length; index += 1) {
      candidates.push(createItinerary([topFoods[index]], 2, 'Food-centric plan.'));
      const next = topFoods[index + 1];
      if (next) {
        candidates.push(
          createItinerary(
            [topFoods[index], next],
            3,
            'Taste-focused crawl with two food stops.',
          ),
        );
      }
    }
  }

  const ranked = candidates.sort((left, right) => right.score - left.score);
  const deduped: ItineraryOption[] = [];
  const seen = new Set<string>();

  for (const itinerary of ranked) {
    if (seen.has(itinerary.id)) {
      continue;
    }
    deduped.push(itinerary);
    seen.add(itinerary.id);
    if (deduped.length === 3) {
      break;
    }
  }

  if (deduped.length < 3) {
    for (const single of scored) {
      const itinerary = createItinerary([single], 0, 'Fallback pick based on your constraints.');
      if (seen.has(itinerary.id)) {
        continue;
      }
      deduped.push(itinerary);
      seen.add(itinerary.id);
      if (deduped.length === 3) {
        break;
      }
    }
  }

  return deduped;
}
