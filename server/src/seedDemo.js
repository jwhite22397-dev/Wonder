// Seeds two connected demo accounts so you can try Date/Friends mode immediately.
//   npm --workspace server run seed
// Then log in with the credentials printed below.
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import db from './db.js';

function upsertUser({ email, name, password, profile, home }) {
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  const hash = bcrypt.hashSync(password, 10);
  if (existing) {
    db.prepare('UPDATE users SET name=?, password_hash=?, profile=?, home_lat=?, home_lng=?, home_label=? WHERE id=?')
      .run(name, hash, JSON.stringify(profile), home.lat, home.lng, home.label, existing.id);
    return existing.id;
  }
  const id = nanoid();
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  db.prepare('INSERT INTO users (id,email,name,password_hash,share_code,profile,home_lat,home_lng,home_label) VALUES (?,?,?,?,?,?,?,?,?)')
    .run(id, email, name, hash, code, JSON.stringify(profile), home.lat, home.lng, home.label);
  return id;
}

const home = { lat: 37.7749, lng: -122.4194, label: 'San Francisco, CA' };

const alex = upsertUser({
  email: 'alex@example.com',
  name: 'Alex',
  password: 'password123',
  home,
  profile: {
    tags: { italian: 3, japanese: 2, hiking: 3, museums: 2, concerts: 2, cafe: 2, breweries: 1 },
    vibes: { pace: 0.7, social: 0.6, novelty: 0.7 },
    dietary: [],
  },
});

const sam = upsertUser({
  email: 'sam@example.com',
  name: 'Sam',
  password: 'password123',
  home,
  profile: {
    tags: { japanese: 3, seafood: 2, museums: 3, dessert: 3, hiking: 1, wellness: 2, breweries: 1 },
    vibes: { pace: 0.4, social: 0.4, novelty: 0.5 },
    dietary: [],
  },
});

const [a, b] = [alex, sam].sort();
const existing = db.prepare('SELECT * FROM connections WHERE user_a=? AND user_b=?').get(a, b);
if (!existing) {
  db.prepare('INSERT INTO connections (id,user_a,user_b,relation,status) VALUES (?,?,?,?,?)')
    .run(nanoid(), a, b, 'partner', 'accepted');
}

console.log('Seeded demo accounts (both password: password123):');
console.log('  alex@example.com');
console.log('  sam@example.com');
console.log('They are connected as partners and both based in San Francisco.');
