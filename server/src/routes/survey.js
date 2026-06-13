import { Router } from 'express';
import { z } from 'zod';
import db from '../db.js';
import { requireAuth } from '../auth.js';
import { publicUser, getUserById } from './helpers.js';
import {
  INTEREST_GROUPS,
  VIBES,
  DIETARY,
  MODES,
  ALL_TAGS,
  isValidTag,
} from '../data/taxonomy.js';

const router = Router();

// Expose the taxonomy so the client can render the survey from one source of truth.
router.get('/taxonomy', (_req, res) => {
  res.json({ groups: INTEREST_GROUPS, vibes: VIBES, dietary: DIETARY, modes: MODES });
});

const dietaryIds = DIETARY.map((d) => d.id);

const profileSchema = z.object({
  tags: z.record(z.string(), z.number().min(0).max(3)),
  vibes: z
    .object({
      pace: z.number().min(0).max(1),
      social: z.number().min(0).max(1),
      novelty: z.number().min(0).max(1),
    })
    .partial()
    .optional(),
  dietary: z.array(z.string()).optional(),
});

router.put('/me/profile', requireAuth, (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid survey data.' });

  const cleanTags = {};
  for (const [tag, w] of Object.entries(parsed.data.tags)) {
    if (isValidTag(tag) && w > 0) cleanTags[tag] = w;
  }
  const vibes = {
    pace: parsed.data.vibes?.pace ?? 0.5,
    social: parsed.data.vibes?.social ?? 0.5,
    novelty: parsed.data.vibes?.novelty ?? 0.5,
  };
  const dietary = (parsed.data.dietary || []).filter((d) => dietaryIds.includes(d));

  const profile = { tags: cleanTags, vibes, dietary, updatedAt: new Date().toISOString() };
  db.prepare('UPDATE users SET profile = ? WHERE id = ?').run(JSON.stringify(profile), req.userId);
  res.json({ user: publicUser(getUserById.get(req.userId)) });
});

export default router;
export { ALL_TAGS };
