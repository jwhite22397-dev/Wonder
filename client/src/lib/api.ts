// Thin fetch wrapper around the Wonder API with bearer-token auth.

const TOKEN_KEY = 'wonder.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  let body: any = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text };
    }
  }
  if (!res.ok) {
    throw new ApiError(body?.error || `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

// ---- types ------------------------------------------------------------------
export interface Profile {
  tags: Record<string, number>;
  vibes: { pace: number; social: number; novelty: number };
  dietary: string[];
}
export interface User {
  id: string;
  email: string;
  name: string;
  shareCode: string;
  profile: Profile | null;
  home: { lat: number; lng: number; label?: string } | null;
  createdAt: string;
}
export interface Tag {
  id: string;
  label: string;
}
export interface InterestGroup {
  id: string;
  label: string;
  hint: string;
  tags: Tag[];
}
export interface Vibe {
  id: string;
  label: string;
  low: string;
  high: string;
}
export interface DietaryOption {
  id: string;
  label: string;
}
export interface Mode {
  id: 'solo' | 'friends' | 'date';
  label: string;
  blurb: string;
  emoji: string;
}
export interface Taxonomy {
  groups: InterestGroup[];
  vibes: Vibe[];
  dietary: DietaryOption[];
  modes: Mode[];
}
export interface Connection {
  id: string;
  relation: 'friend' | 'partner';
  since: string;
  person: { id: string; name: string; shareCode: string; hasProfile: boolean };
}
export interface Stop {
  id: string;
  name: string;
  kind: 'food' | 'activity';
  meal: string | null;
  tags: string[];
  priceLevel: number;
  priceLabel: string;
  costPerPerson: number;
  durationMin: number;
  distanceMi: number;
  lat: number;
  lng: number;
  indoor: boolean;
  startTime: string;
  endTime: string;
  travelFromPrevMin: number | null;
  reasons: string[];
  mapUrl: string;
}
export interface Itinerary {
  key: string;
  title: string;
  blurb: string;
  emoji: string;
  stops: Stop[];
  summary: {
    stopCount: number;
    estCostPerPerson: number;
    estCostTotal: number;
    maxDistanceMi: number;
    totalMinutes: number;
    withinBudget: boolean;
  };
  directionsUrl: string;
}
export interface PlanRequest {
  mode: 'solo' | 'friends' | 'date';
  participantIds?: string[];
  location: { lat: number; lng: number; label?: string };
  radiusMi: number;
  budgetPerPerson: number;
  date?: string;
  startTime: string;
  endTime: string;
  include: { food: boolean; activities: boolean };
}
export interface GenerateResult {
  request: PlanRequest;
  participants: { id: string; name: string; you: boolean }[];
  itineraries: Itinerary[];
}
export interface Plan {
  id: string;
  mode: string;
  title: string;
  request: PlanRequest & { _participants?: any };
  itinerary: Itinerary;
  createdAt: string;
}

// ---- endpoints --------------------------------------------------------------
export const api = {
  signup: (data: { email: string; name: string; password: string }) =>
    request<{ token: string; user: User }>('/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request<{ user: User }>('/me'),
  setHome: (data: { lat: number; lng: number; label?: string }) =>
    request<{ user: User }>('/me/home', { method: 'PUT', body: JSON.stringify(data) }),
  saveProfile: (data: Profile) =>
    request<{ user: User }>('/me/profile', { method: 'PUT', body: JSON.stringify(data) }),
  taxonomy: () => request<Taxonomy>('/taxonomy'),
  connections: () => request<{ connections: Connection[] }>('/connections'),
  connect: (data: { shareCode: string; relation?: 'friend' | 'partner' }) =>
    request<{ person: any; relation: string }>('/connections', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  removeConnection: (id: string) =>
    request<{ ok: boolean }>(`/connections/${id}`, { method: 'DELETE' }),
  generate: (data: PlanRequest) =>
    request<GenerateResult>('/plans/generate', { method: 'POST', body: JSON.stringify(data) }),
  savePlan: (data: { mode: string; title: string; request: any; itinerary: Itinerary }) =>
    request<{ plan: Plan }>('/plans', { method: 'POST', body: JSON.stringify(data) }),
  plans: () => request<{ plans: Plan[] }>('/plans'),
  plan: (id: string) => request<{ plan: Plan }>(`/plans/${id}`),
  deletePlan: (id: string) => request<{ ok: boolean }>(`/plans/${id}`, { method: 'DELETE' }),
};
