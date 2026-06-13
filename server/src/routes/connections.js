import { Router } from 'express';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import db from '../db.js';
import { requireAuth } from '../auth.js';
import { miniUser, getUserById, getUserByShareCode } from './helpers.js';

const router = Router();

// List everyone the current user is connected with (in either direction).
router.get('/connections', requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.*, 
        ua.id AS a_id, ua.name AS a_name, ua.share_code AS a_code, ua.profile AS a_profile,
        ub.id AS b_id, ub.name AS b_name, ub.share_code AS b_code, ub.profile AS b_profile
       FROM connections c
       JOIN users ua ON ua.id = c.user_a
       JOIN users ub ON ub.id = c.user_b
       WHERE c.user_a = ? OR c.user_b = ?
       ORDER BY c.created_at DESC`
    )
    .all(req.userId, req.userId);

  const connections = rows.map((r) => {
    const isA = r.user_a === req.userId;
    const other = isA
      ? { id: r.b_id, name: r.b_name, share_code: r.b_code, profile: r.b_profile }
      : { id: r.a_id, name: r.a_name, share_code: r.a_code, profile: r.a_profile };
    return { id: r.id, relation: r.relation, since: r.created_at, person: miniUser(other) };
  });
  res.json({ connections });
});

const connectSchema = z.object({
  shareCode: z.string().min(4).max(12),
  relation: z.enum(['friend', 'partner']).optional(),
});

// Connect to another user by their share code (mutual immediately for simplicity).
router.post('/connections', requireAuth, (req, res) => {
  const parsed = connectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'A valid share code is required.' });
  const code = parsed.data.shareCode.toUpperCase().trim();
  const relation = parsed.data.relation || 'friend';

  const target = getUserByShareCode.get(code);
  if (!target) return res.status(404).json({ error: 'No one found with that code.' });
  if (target.id === req.userId) return res.status(400).json({ error: "That's your own code!" });

  // Normalize ordering so the UNIQUE(user_a, user_b) constraint dedupes either direction.
  const [a, b] = [req.userId, target.id].sort();
  const existing = db
    .prepare('SELECT * FROM connections WHERE user_a = ? AND user_b = ?')
    .get(a, b);
  if (existing) {
    db.prepare('UPDATE connections SET relation = ? WHERE id = ?').run(relation, existing.id);
  } else {
    db.prepare(
      'INSERT INTO connections (id, user_a, user_b, relation, status) VALUES (?, ?, ?, ?, ?)'
    ).run(nanoid(), a, b, relation, 'accepted');
  }

  res.status(201).json({ person: miniUser(target), relation });
});

router.delete('/connections/:id', requireAuth, (req, res) => {
  const conn = db.prepare('SELECT * FROM connections WHERE id = ?').get(req.params.id);
  if (!conn) return res.status(404).json({ error: 'Connection not found' });
  if (conn.user_a !== req.userId && conn.user_b !== req.userId) {
    return res.status(403).json({ error: 'Not allowed' });
  }
  db.prepare('DELETE FROM connections WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// Helper used by the plans route to verify the owner is connected to participants.
export function areConnected(userId, otherId) {
  const [a, b] = [userId, otherId].sort();
  return !!db.prepare('SELECT 1 FROM connections WHERE user_a = ? AND user_b = ?').get(a, b);
}

export default router;
