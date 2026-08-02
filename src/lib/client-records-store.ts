import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  AdherencePoint,
  ClientRecord,
  DemoUser,
  ExchangePlan,
  MealEntry,
} from "@/types/app";
import {
  calculateExchangePlan,
  calculateWaterGoalMl,
  type OnboardingInputs,
} from "@/lib/plan-calculator";
import { emptyExchangePlan } from "@/lib/exchanges";

export type PersistedClientRecord = {
  user: DemoUser;
  plan: ExchangePlan;
  waterGoalMl: number;
  onboardingCompleted: boolean;
  onboardingInputs?: OnboardingInputs;
  adherence: AdherencePoint[];
  recentMeals: MealEntry[];
};

type ClientRecordsStore = {
  recordsByUserId: Record<string, PersistedClientRecord>;
  recordsByEmail: Record<string, string>;
  getRecord: (user: DemoUser | null | undefined) => PersistedClientRecord | null;
  upsertUser: (user: DemoUser) => PersistedClientRecord;
  completeOnboarding: (
    userId: string,
    userUpdate: Partial<DemoUser>,
    inputs: OnboardingInputs,
  ) => PersistedClientRecord;
  updatePlan: (userId: string, plan: ExchangePlan) => void;
  updateWaterGoal: (userId: string, waterGoalMl: number) => void;
  addMeal: (userId: string, meal: MealEntry) => void;
  updateUser: (userId: string, patch: Partial<DemoUser>) => void;
};

function buildAdherence(weightKg = 70): AdherencePoint[] {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
    day,
    adherence: 70 + ((i * 5) % 25),
    waterMl: 1600 + ((i * 130) % 1100),
    weightKg: Number((weightKg - i * 0.05).toFixed(1)),
  }));
}

export const useClientRecordsStore = create<ClientRecordsStore>()(
  persist(
    (set, get) => ({
      recordsByUserId: {},
      recordsByEmail: {},
      getRecord: (user) => {
        if (!user) return null;
        const byId = get().recordsByUserId[user.id];
        if (byId) return byId;
        if (user.email) {
          const uid = get().recordsByEmail[user.email.toLowerCase()];
          if (uid) return get().recordsByUserId[uid] ?? null;
        }
        return null;
      },
      upsertUser: (user) => {
        const existing = get().getRecord(user);
        if (existing) return existing;
        const rec: PersistedClientRecord = {
          user: { ...user },
          plan: emptyExchangePlan(),
          waterGoalMl: 2200,
          onboardingCompleted: false,
          adherence: buildAdherence(user.weightKg),
          recentMeals: [],
        };
        set((s) => ({
          recordsByUserId: { ...s.recordsByUserId, [user.id]: rec },
          recordsByEmail: user.email
            ? {
                ...s.recordsByEmail,
                [user.email.toLowerCase()]: user.id,
              }
            : s.recordsByEmail,
        }));
        return get().recordsByUserId[user.id];
      },
      completeOnboarding: (userId, userUpdate, inputs) => {
        const existing = get().recordsByUserId[userId];
        const mergedUser: DemoUser = {
          ...(existing?.user ?? {
            id: userId,
            fullName: "Client",
            email: "",
            role: "client",
          }),
          ...userUpdate,
          sex: inputs.sex,
          age: inputs.ageYears,
          heightCm: inputs.heightCm,
          weightKg: inputs.weightKg,
          activityLevel: inputs.activityLevel,
          goal: inputs.goal,
        } as DemoUser;
        const plan = calculateExchangePlan(inputs);
        const waterGoalMl = calculateWaterGoalMl(inputs);
        const rec: PersistedClientRecord = {
          user: mergedUser,
          plan,
          waterGoalMl,
          onboardingCompleted: true,
          onboardingInputs: inputs,
          adherence: buildAdherence(inputs.weightKg),
          recentMeals: existing?.recentMeals ?? [],
        };
        set((s) => ({
          recordsByUserId: { ...s.recordsByUserId, [userId]: rec },
          recordsByEmail: mergedUser.email
            ? {
                ...s.recordsByEmail,
                [mergedUser.email.toLowerCase()]: userId,
              }
            : s.recordsByEmail,
        }));
        return get().recordsByUserId[userId];
      },
      updatePlan: (userId, plan) =>
        set((s) => {
          const rec = s.recordsByUserId[userId];
          if (!rec) return s;
          return {
            recordsByUserId: {
              ...s.recordsByUserId,
              [userId]: { ...rec, plan },
            },
          };
        }),
      updateWaterGoal: (userId, waterGoalMl) =>
        set((s) => {
          const rec = s.recordsByUserId[userId];
          if (!rec) return s;
          return {
            recordsByUserId: {
              ...s.recordsByUserId,
              [userId]: { ...rec, waterGoalMl },
            },
          };
        }),
      addMeal: (userId, meal) =>
        set((s) => {
          const rec = s.recordsByUserId[userId];
          if (!rec) return s;
          return {
            recordsByUserId: {
              ...s.recordsByUserId,
              [userId]: {
                ...rec,
                recentMeals: [meal, ...rec.recentMeals].slice(0, 20),
              },
            },
          };
        }),
      updateUser: (userId, patch) =>
        set((s) => {
          const rec = s.recordsByUserId[userId];
          if (!rec) return s;
          const updatedUser = { ...rec.user, ...patch } as DemoUser;
          const next: PersistedClientRecord = { ...rec, user: updatedUser };
          if (patch.email) {
            return {
              recordsByUserId: { ...s.recordsByUserId, [userId]: next },
              recordsByEmail: {
                ...s.recordsByEmail,
                [patch.email.toLowerCase()]: userId,
              },
            };
          }
          return {
            recordsByUserId: { ...s.recordsByUserId, [userId]: next },
          };
        }),
    }),
    { name: "novaturient-client-records" },
  ),
);

export function persistedRecordToClientRecord(
  rec: PersistedClientRecord | null,
): ClientRecord | null {
  if (!rec) return null;
  return {
    user: rec.user,
    plan: rec.plan,
    adherence: rec.adherence,
    recentMeals: rec.recentMeals,
    waterGoalMl: rec.waterGoalMl,
  };
}
