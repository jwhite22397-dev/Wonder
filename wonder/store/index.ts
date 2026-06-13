import { create } from 'zustand';
import { UserProfile, PlanRequest, GeneratedPlans } from '../types';

interface AppState {
  user: UserProfile | null;
  isAuthLoading: boolean;
  currentPlanRequest: PlanRequest | null;
  generatedPlans: GeneratedPlans | null;
  selectedPlanId: string | null;

  setUser: (user: UserProfile | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setPlanRequest: (request: PlanRequest | null) => void;
  setGeneratedPlans: (plans: GeneratedPlans | null) => void;
  setSelectedPlan: (id: string | null) => void;
  clearPlans: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthLoading: true,
  currentPlanRequest: null,
  generatedPlans: null,
  selectedPlanId: null,

  setUser: (user) => set({ user }),
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),
  setPlanRequest: (request) => set({ currentPlanRequest: request }),
  setGeneratedPlans: (plans) => set({ generatedPlans: plans }),
  setSelectedPlan: (id) => set({ selectedPlanId: id }),
  clearPlans: () => set({ generatedPlans: null, currentPlanRequest: null, selectedPlanId: null }),
}));
