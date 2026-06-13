// Geo helpers + deterministic placement of catalog venues around a location.

const EARTH_RADIUS_MI = 3958.8;

export function haversineMiles(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Small deterministic PRNG (mulberry32) so a given seed always yields the same layout.
export function makeRng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Offset a coordinate by a distance (miles) at a bearing (radians).
export function offsetCoord(origin, distMiles, bearing) {
  const dLat = (distMiles / EARTH_RADIUS_MI) * Math.cos(bearing);
  const lat = origin.lat + (dLat * 180) / Math.PI;
  const dLng =
    (distMiles / (EARTH_RADIUS_MI * Math.cos((origin.lat * Math.PI) / 180))) *
    Math.sin(bearing);
  const lng = origin.lng + (dLng * 180) / Math.PI;
  return { lat, lng };
}

// Place a venue template at a deterministic point within `radiusMi` of `origin`.
// Venues closer to home are slightly favored by biasing the distance distribution inward.
export function placeVenue(template, origin, radiusMi, rng) {
  const bearing = rng() * 2 * Math.PI;
  // sqrt for uniform-area distribution, then bias inward a touch
  const r = Math.sqrt(rng()) * radiusMi * (0.35 + 0.65 * rng());
  const coord = offsetCoord(origin, r, bearing);
  const distance = haversineMiles(origin, coord);
  return { ...template, lat: coord.lat, lng: coord.lng, distanceMi: Math.round(distance * 10) / 10 };
}
