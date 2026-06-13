import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import db from '../db.js';
import { signToken, requireAuth } from '../auth.js';
import { publicUser, getUserById, getUserByEmail } from './helpers.js';

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(60),
  password: z.string().min(6).max(200),
});

function uniqueShareCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = '';
    for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
    const existing = db.prepare('SELECT 1 FROM users WHERE share_code = ?').get(code);
    if (!existing) return code;
  }
  return nanoid(8).toUpperCase();
}

router.post('/signup', (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { email, name, password } = parsed.data;
  const normEmail = email.toLowerCase().trim();

  if (getUserByEmail.get(normEmail)) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const id = nanoid();
  const hash = bcrypt.hashSync(password, 10);
  const shareCode = uniqueShareCode();
  db.prepare(
    'INSERT INTO users (id, email, name, password_hash, share_code, profile) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, normEmail, name.trim(), hash, shareCode, null);

  const user = getUserById.get(id);
  const token = signToken(user);
  res.status(201).json({ token, user: publicUser(user) });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Email and password are required.' });
  const { email, password } = parsed.data;
  const user = getUserByEmail.get(email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  const user = getUserById.get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(user) });
});

const homeSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  label: z.string().max(120).optional(),
});

router.put('/me/home', requireAuth, (req, res) => {
  const parsed = homeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid location.' });
  const { lat, lng, label } = parsed.data;
  db.prepare('UPDATE users SET home_lat = ?, home_lng = ?, home_label = ? WHERE id = ?').run(
    lat,
    lng,
    label || null,
    req.userId
  );
  res.json({ user: publicUser(getUserById.get(req.userId)) });
});

export default router;
