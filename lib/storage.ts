import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthSession, SavedPlan, UserProfile } from './types';

const KEYS = {
  users: '@wonder/users',
  session: '@wonder/session',
  plans: '@wonder/plans',
};

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `h${Math.abs(hash).toString(36)}`;
}

export async function getUsers(): Promise<UserProfile[]> {
  const raw = await AsyncStorage.getItem(KEYS.users);
  return raw ? JSON.parse(raw) : [];
}

async function saveUsers(users: UserProfile[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.users, JSON.stringify(users));
}

export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<UserProfile> {
  const users = await getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email === normalizedEmail)) {
    throw new Error('An account with this email already exists');
  }

  const user: UserProfile = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email: normalizedEmail,
    name: name.trim(),
    passwordHash: simpleHash(password),
    interests: [],
    foodPreferences: [],
    dietaryRestrictions: ['none'],
    energyLevel: 'moderate',
    defaultBudget: 'moderate',
    defaultRadiusMiles: 15,
    surveyCompleted: false,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await saveUsers(users);
  return user;
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const users = await getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(
    (u) => u.email === normalizedEmail && u.passwordHash === simpleHash(password)
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  return user;
}

export async function updateUserProfile(user: UserProfile): Promise<UserProfile> {
  const users = await getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index === -1) throw new Error('User not found');
  users[index] = user;
  await saveUsers(users);
  return user;
}

export async function getUserById(id: string): Promise<UserProfile | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function getOtherUsers(excludeId: string): Promise<UserProfile[]> {
  const users = await getUsers();
  return users.filter((u) => u.id !== excludeId && u.surveyCompleted);
}

export async function saveSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(KEYS.session, JSON.stringify(session));
}

export async function getSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(KEYS.session);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.session);
}

export async function getPlanById(planId: string): Promise<SavedPlan | null> {
  const raw = await AsyncStorage.getItem(KEYS.plans);
  const all: SavedPlan[] = raw ? JSON.parse(raw) : [];
  return all.find((p) => p.id === planId) ?? null;
}

export async function getSavedPlans(userId: string): Promise<SavedPlan[]> {
  const raw = await AsyncStorage.getItem(KEYS.plans);
  const all: SavedPlan[] = raw ? JSON.parse(raw) : [];
  return all
    .filter((p) => p.request.participantIds.includes(userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function savePlan(plan: SavedPlan): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.plans);
  const all: SavedPlan[] = raw ? JSON.parse(raw) : [];
  all.unshift(plan);
  await AsyncStorage.setItem(KEYS.plans, JSON.stringify(all.slice(0, 50)));
}

export async function updateSavedPlan(plan: SavedPlan): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.plans);
  const all: SavedPlan[] = raw ? JSON.parse(raw) : [];
  const index = all.findIndex((p) => p.id === plan.id);
  if (index >= 0) {
    all[index] = plan;
    await AsyncStorage.setItem(KEYS.plans, JSON.stringify(all));
  }
}
