// Scoring: how well a venue fits a group of people in a given mode/vibe.

// Approximate per-person cost for each price level.
export const PRICE_COST = { 0: 0, 1: 15, 2: 35, 3: 65, 4: 110 };

export function costForVenue(venue) {
  return PRICE_COST[venue.price] ?? 35;
}

const PRICE_LABEL = { 0: 'Free', 1: '$', 2: '$$', 3: '$$$', 4: '$$$$' };
export function priceLabel(price) {
  return PRICE_LABEL[price] ?? '$$';
}

// Build a merged group preference from participant profiles.
// Each profile: { tags: {tagId: 0..3}, vibes: {pace,social,novelty: 0..1}, dietary: [..] }
export function mergeProfiles(profiles) {
  const tagSum = {};
  const tagPeople = {};
  const vibes = { pace: 0, social: 0, novelty: 0 };
  const dietary = new Set();
  const n = Math.max(profiles.length, 1);

  for (const p of profiles) {
    const tags = (p && p.tags) || {};
    for (const [tag, w] of Object.entries(tags)) {
      tagSum[tag] = (tagSum[tag] || 0) + Number(w || 0);
      if (Number(w) > 0) tagPeople[tag] = (tagPeople[tag] || 0) + 1;
    }
    const v = (p && p.vibes) || {};
    vibes.pace += Number(v.pace ?? 0.5);
    vibes.social += Number(v.social ?? 0.5);
    vibes.novelty += Number(v.novelty ?? 0.5);
    for (const d of (p && p.dietary) || []) dietary.add(d);
  }

  vibes.pace /= n;
  vibes.social /= n;
  vibes.novelty /= n;

  return { tagSum, tagPeople, vibes, dietary: [...dietary], count: n };
}

// Per-participant interest in a venue (0..1). Rewards the best matching tag and
// gives partial credit for additional matches.
function personInterest(profile, venue) {
  const tags = (profile && profile.tags) || {};
  const matched = venue.tags.map((t) => Number(tags[t] || 0)).filter((w) => w > 0);
  if (matched.length === 0) return 0;
  const best = Math.max(...matched);
  const rest = matched.reduce((a, b) => a + b, 0) - best;
  // best counts fully (max 3), extras give a small bonus, normalized to ~0..1
  return Math.min(1, (best + 0.2 * rest) / 3);
}

// Group interest: reward mutual enjoyment (blend of average and the least-happy person).
function groupInterest(profiles, venue, mode) {
  const scores = profiles.map((p) => personInterest(p, venue));
  if (scores.length === 0) return 0.4;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const min = Math.min(...scores);
  if (mode === 'solo' || profiles.length === 1) return avg;
  // For date/friends, mutual interest matters more.
  return 0.55 * avg + 0.45 * min;
}

function dietaryPenalty(merged, venue) {
  if (venue.kind !== 'food') return 0;
  let penalty = 0;
  for (const need of merged.dietary) {
    if (need === 'no_alcohol') continue; // handled by avoiding drinks-only stops elsewhere
    if (!venue.diet.includes(need)) penalty += 0.18;
  }
  return Math.min(penalty, 0.6);
}

// Vibe alignment 0..1: how well the venue's energy/social feel matches the group's vibe.
function vibeAlignment(merged, venue, variant) {
  const want = { ...merged.vibes };
  // Variants nudge the desired vibe to diversify the three itineraries.
  if (variant === 'adventurous') want.pace = Math.min(1, want.pace + 0.3);
  if (variant === 'cozy') {
    want.pace = Math.max(0, want.pace - 0.3);
    want.social = Math.max(0, want.social - 0.2);
  }
  const paceFit = 1 - Math.abs(venue.energy - want.pace);
  const socialFit = 1 - Math.abs(venue.social - want.social);
  return 0.6 * paceFit + 0.4 * socialFit;
}

// Full venue score for a request. Returns { score, reasons:[..] }.
export function scoreVenue({ profiles, merged, venue, mode, variant, budgetPerStop }) {
  const interest = groupInterest(profiles, venue, mode);
  const suitability = venue.suited[mode] ?? 0.6;
  const vibe = vibeAlignment(merged, venue, variant);
  const romantic = mode === 'date' ? venue.romantic : 0;
  const diet = dietaryPenalty(merged, venue);

  // Distance: nearer is better but mild (everything is already within radius).
  const distPenalty = Math.min(0.25, (venue.distanceMi || 0) * 0.02);

  // Budget fit per stop (soft): going over the per-stop share costs points.
  const cost = costForVenue(venue);
  let budgetPenalty = 0;
  if (budgetPerStop != null && cost > budgetPerStop) {
    budgetPenalty = Math.min(0.4, ((cost - budgetPerStop) / Math.max(budgetPerStop, 15)) * 0.3);
  }

  // Quality: when real ratings are available, gently favor well-reviewed places.
  const ratingBoost =
    typeof venue.rating === 'number'
      ? Math.max(-0.05, Math.min(0.08, (venue.rating - 4.0) * 0.06))
      : 0;

  let score =
    0.42 * interest +
    0.2 * suitability +
    0.18 * vibe +
    0.15 * romantic +
    ratingBoost -
    distPenalty -
    diet -
    budgetPenalty;

  // Novelty: when the group wants new things, give a small varied boost.
  score += (merged.vibes.novelty - 0.5) * 0.05;

  score = Math.max(0, score);

  const reasons = [];
  if (interest > 0.55) reasons.push('matches your interests');
  else if (interest > 0.25) reasons.push('a little something you like');
  if (mode === 'date' && romantic > 0.7) reasons.push('great date-night vibe');
  if (mode === 'friends' && venue.social > 0.7) reasons.push('fun with a group');
  if (mode === 'solo' && suitability > 0.85) reasons.push('perfect for going solo');
  if (venue.price <= 1) reasons.push('easy on the wallet');
  if (venue.distanceMi != null && venue.distanceMi <= 3) reasons.push('close by');
  if (typeof venue.rating === 'number' && venue.rating >= 4.4) reasons.push(`highly rated (${venue.rating.toFixed(1)}\u2605)`);

  return { score, reasons, cost, interest };
}
