import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import db from '../db.js';
import { requireAuth } from '../auth.js';
import { getUserById } from './helpers.js';
import { areConnected } from './connections.js';
import { generateItineraries } from '../engine/itinerary.js';

const router = Router();

const DEFAULT_PROFILE = { tags: {}, vibes: { pace: 0.5, social: 0.5, novelty: 0.5 }, dietary: [] };

const generateSchema = z.object({
  mode: z.enum(['solo', 'friends', 'date']),
  participantIds: z.array(z.string()).optional(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    label: z.string().max(120).optional(),
  }),
  radiusMi: z.number().min(1).max(200),
  budgetPerPerson: z.number().min(0).max(2000),
  date: z.string().optional(),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/),
  endTime: z.string().regex(/^\d{1,2}:\d{2}$/),
  include: z
    .object({ food: z.boolean(), activities: z.boolean() })
    .refine((v) => v.food || v.activities, { message: 'Include food, activities, or both.' }),
});

router.post('/plans/generate', requireAuth, (req, res) => {
  const parsed = generateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const input = parsed.data;

  const owner = getUserById.get(req.userId);
  const profiles = [parseProfile(owner)];
  const participants = [{ id: owner.id, name: owner.name, you: true }];

  let participantIds = input.participantIds || [];
  if (input.mode === 'solo') participantIds = [];

  for (const pid of participantIds) {
    if (pid === owner.id) continue;
    if (!areConnected(owner.id, pid)) {
      return res.status(403).json({ error: 'You can only plan with people you are connected to.' });
    }
    const u = getUserById.get(pid);
    if (!u) continue;
    profiles.push(parseProfile(u));
    participants.push({ id: u.id, name: u.name, you: false });
  }

  if (input.mode === 'date' && participants.length < 2) {
    return res.status(400).json({ error: 'Pick the person you are going on a date with.' });
  }
  if (input.mode === 'friends' && participants.length < 2) {
    return res.status(400).json({ error: 'Add at least one friend to plan with.' });
  }

  const itineraries = generateItineraries(input, profiles);
  if (!itineraries.length) {
    return res.status(422).json({
      error:
        'Could not find enough nearby options. Try a larger radius, a bigger budget, or a wider time window.',
    });
  }

  res.json({ request: input, participants, itineraries });
});

const saveSchema = z.object({
  mode: z.enum(['solo', 'friends', 'date']),
  title: z.string().min(1).max(120),
  request: z.any(),
  itinerary: z.any(),
});

router.post('/plans', requireAuth, (req, res) => {
  const parsed = saveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid plan data.' });
  const { mode, title, request, itinerary } = parsed.data;
  const id = nanoid();
  db.prepare(
    'INSERT INTO plans (id, owner_id, mode, title, request, itinerary) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, req.userId, mode, title, JSON.stringify(request), JSON.stringify(itinerary));
  res.status(201).json({ plan: rowToPlan(db.prepare('SELECT * FROM plans WHERE id = ?').get(id)) });
});

router.get('/plans', requireAuth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM plans WHERE owner_id = ? ORDER BY created_at DESC')
    .all(req.userId);
  res.json({ plans: rows.map(rowToPlan) });
});

router.get('/plans/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
  if (!row || row.owner_id !== req.userId) return res.status(404).json({ error: 'Plan not found' });
  res.json({ plan: rowToPlan(row) });
});

router.delete('/plans/:id', requireAuth, (req, res) => {
  const row = db.prepare('SELECT * FROM plans WHERE id = ?').get(req.params.id);
  if (!row || row.owner_id !== req.userId) return res.status(404).json({ error: 'Plan not found' });
  db.prepare('DELETE FROM plans WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

function parseProfile(user) {
  if (!user?.profile) return { ...DEFAULT_PROFILE };
  try {
    const p = JSON.parse(user.profile);
    return {
      tags: p.tags || {},
      vibes: { ...DEFAULT_PROFILE.vibes, ...(p.vibes || {}) },
      dietary: p.dietary || [],
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

function rowToPlan(row) {
  return {
    id: row.id,
    mode: row.mode,
    title: row.title,
    request: JSON.parse(row.request),
    itinerary: JSON.parse(row.itinerary),
    createdAt: row.created_at,
  };
}

export default router;
