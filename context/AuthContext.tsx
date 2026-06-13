import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  clearSession,
  getSession,
  getUserById,
  loginUser,
  registerUser,
  saveSession,
  updateUserProfile,
} from '@/lib/storage';
import { UserProfile } from '@/lib/types';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const session = await getSession();
      if (session) {
        const profile = await getUserById(session.userId);
        setUser(profile);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const signUp = async (email: string, password: string, name: string) => {
    const profile = await registerUser(email, password, name);
    await saveSession({ userId: profile.id, email: profile.email });
    setUser(profile);
  };

  const signIn = async (email: string, password: string) => {
    const profile = await loginUser(email, password);
    await saveSession({ userId: profile.id, email: profile.email });
    setUser(profile);
  };

  const signOut = async () => {
    await clearSession();
    setUser(null);
  };

  const updateProfile = async (profile: UserProfile) => {
    const updated = await updateUserProfile(profile);
    setUser(updated);
  };

  const refreshUser = async () => {
    if (user) {
      const profile = await getUserById(user.id);
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signUp, signIn, signOut, updateProfile, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
