import OpenAI from 'openai';
import { PlanRequest, GeneratedPlans, UserInterests, PlanMode } from '../types';
import { ACTIVITY_CATEGORIES, BUDGET_OPTIONS, VIBE_OPTIONS } from '../constants';

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

function buildInterestsDescription(interests: UserInterests, label: string): string {
  const categories = interests.categories
    .map((c) => ACTIVITY_CATEGORIES.find((a) => a.value === c)?.label ?? c)
    .join(', ');
  const vibes = interests.favoriteVibe
    .map((v) => VIBE_OPTIONS.find((o) => o.value === v)?.label ?? v)
    .join(', ');
  const dietary = interests.dietaryPreferences.join(', ');
  const avoid = interests.avoidCategories
    .map((c) => ACTIVITY_CATEGORIES.find((a) => a.value === c)?.label ?? c)
    .join(', ');

  return `
${label}:
- Interested in: ${categories || 'no preference'}
- Preferred vibes: ${vibes || 'no preference'}
- Dietary needs: ${dietary || 'none'}
- Avoid: ${avoid || 'nothing specific'}`.trim();
}

function buildModeContext(mode: PlanMode, groupSize: number): string {
  switch (mode) {
    case 'solo':
      return 'This is a solo outing — the person wants a fulfilling day entirely for themselves. Focus on self-discovery, personal enjoyment, and experiences that are great alone.';
    case 'friends':
      return `This is a group hangout with ${groupSize} people (including the planner). Focus on fun group activities, social venues, and experiences better shared with friends.`;
    case 'date':
      return 'This is a romantic date. Focus on experiences that build connection, are memorable, and create a special atmosphere. Balance thoughtfulness with fun.';
  }
}

export async function generateItineraries(
  request: PlanRequest,
  userInterests: UserInterests,
): Promise<GeneratedPlans> {
  const budgetLabel = BUDGET_OPTIONS.find((b) => b.value === request.budget)?.description ?? request.budget;
  const modeContext = buildModeContext(request.mode, request.groupSize);
  const userDesc = buildInterestsDescription(userInterests, 'Primary User Interests');
  const partnerDesc = request.partnerInterests
    ? buildInterestsDescription(request.partnerInterests, 'Partner/Group Member Interests')
    : '';

  const prompt = `You are Wonder — a smart itinerary planner. Generate exactly 3 distinct, creative itinerary options for an outing. Each itinerary should feel unique in theme and vibe.

CONTEXT:
${modeContext}

DATE: ${request.date}
TIME: ${request.startTime} to ${request.endTime}
LOCATION: ${request.location.address}
MAX DRIVING RADIUS: ${request.radiusMiles} miles from that location
BUDGET: ${budgetLabel}
${request.specialRequests ? `SPECIAL REQUESTS: ${request.specialRequests}` : ''}

${userDesc}
${partnerDesc}

INSTRUCTIONS:
- Each plan must have 3–6 stops including at least one food/drink stop
- Keep all activities realistically within the stated radius
- Respect dietary preferences and budget throughout
- Each plan should have a distinct vibe/theme
- Include specific types of venues (e.g., "a rooftop bar", "a botanical garden trail", "a ramen restaurant")
- Provide time estimates for each stop
- Each stop needs: time, duration, name/type, description, estimated cost, practical tips, and an emoji

Respond ONLY with valid JSON in this exact structure:
{
  "plan1": {
    "id": "plan1",
    "title": "Plan Title",
    "tagline": "Short punchy tagline",
    "vibe": "One-word vibe descriptor",
    "totalEstimatedCost": "$X–$Y per person",
    "totalDuration": "X hours",
    "highlights": ["highlight1", "highlight2", "highlight3"],
    "bestFor": "Brief description of who/when this is best for",
    "emoji": "single emoji",
    "stops": [
      {
        "time": "2:00 PM",
        "duration": "1.5 hours",
        "name": "Venue/Activity Name",
        "type": "activity|food|travel|rest",
        "category": "category name",
        "description": "2–3 sentence vivid description of this stop and why it fits the plan",
        "address": "general area or neighborhood",
        "estimatedCost": "$X per person or Free",
        "tips": "One practical tip for this stop",
        "emoji": "single emoji"
      }
    ]
  },
  "plan2": { ... },
  "plan3": { ... }
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.85,
    max_tokens: 4000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from AI');

  return JSON.parse(content) as GeneratedPlans;
}
