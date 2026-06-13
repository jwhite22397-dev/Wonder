import db from '../db.js';

export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    shareCode: u.share_code,
    profile: u.profile ? JSON.parse(u.profile) : null,
    home: u.home_lat != null ? { lat: u.home_lat, lng: u.home_lng, label: u.home_label } : null,
    createdAt: u.created_at,
  };
}

// A lighter shape for listing connections / participants.
export function miniUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    shareCode: u.share_code,
    hasProfile: !!(u.profile && JSON.parse(u.profile)?.tags && Object.keys(JSON.parse(u.profile).tags).length),
  };
}

export const getUserById = db.prepare('SELECT * FROM users WHERE id = ?');
export const getUserByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
export const getUserByShareCode = db.prepare('SELECT * FROM users WHERE share_code = ?');
