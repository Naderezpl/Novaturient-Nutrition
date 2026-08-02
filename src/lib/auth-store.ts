import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useClientRecordsStore } from "@/lib/client-records-store";
import { clients, currentClient, dietitianUser } from "@/lib/demo-data";
import type { ClientGoal, DemoUser, UserRole } from "@/types/app";
import type { OnboardingInputs } from "@/lib/plan-calculator";

export const ADMIN_EMAIL = "novaturient.nutritionn@gmail.com";
export const ADMIN_PASSWORD = "admin";

type AuthStore = {
  hydrated: boolean;
  user: DemoUser | null;
  role: UserRole | null;
  onboardingRequired: boolean;
  login: (
    role: UserRole,
    email?: string,
    password?: string,
  ) => { success: boolean; role: UserRole | null; error?: string };
  signupClient: (fullName: string, email: string) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
  setOnboardingRequired: (value: boolean) => void;
  finishOnboarding: (
    inputs: OnboardingInputs,
    userPatch?: Partial<DemoUser>,
  ) => void;
  updateUser: (patch: Partial<DemoUser>) => void;
  updateGoal: (goal: ClientGoal) => void;
};

function findClientByEmail(email?: string) {
  if (!email) {
    return currentClient.user;
  }

  return (
    clients.find((client) => client.user.email === email)?.user ??
    currentClient.user
  );
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,
      role: null,
      onboardingRequired: false,
      login: (role, email, password) => {
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedPassword = password ?? "";

        if (role === "dietitian") {
          if (
            normalizedEmail === ADMIN_EMAIL.toLowerCase() &&
            normalizedPassword === ADMIN_PASSWORD
          ) {
            set({ role: "dietitian", user: dietitianUser, onboardingRequired: false });
            return { success: true, role: "dietitian" };
          }

          return {
            success: false,
            role: null,
            error: "Invalid email or password.",
          };
        }

        const user = findClientByEmail(normalizedEmail);
        useClientRecordsStore.getState().upsertUser(user);
        const persisted = useClientRecordsStore.getState().getRecord(user);
        const needsOnboarding =
          !!(persisted && !persisted.onboardingCompleted) ||
          !!normalizedEmail ||
          false;
        if (normalizedEmail) {
          const fromPersisted =
            useClientRecordsStore.getState().recordsByEmail[normalizedEmail];
          const userId =
            fromPersisted ??
            (clients.find((c) => c.user.email.toLowerCase() === normalizedEmail)
              ?.user.id as string | undefined) ??
            user.id;
          const fullUser = { ...user, id: userId, email: normalizedEmail };
          useClientRecordsStore.getState().upsertUser(fullUser);
          const recheck =
            useClientRecordsStore.getState().getRecord(fullUser);
          set({
            role: "client",
            user: fullUser,
            onboardingRequired: !recheck?.onboardingCompleted,
          });
        } else {
          set({ role: "client", user, onboardingRequired: needsOnboarding });
        }
        return { success: true, role: "client" };
      },
      signupClient: (fullName, email) => {
        const normalizedEmail = email.trim().toLowerCase();
        const userId =
          "client-" + normalizedEmail.replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
        const user: DemoUser = {
          id: userId,
          fullName,
          email: normalizedEmail,
          role: "client",
          joinDate: new Date().toISOString().slice(0, 10),
        };
        useClientRecordsStore.getState().upsertUser(user);
        set({ role: "client", user, onboardingRequired: true });
      },
      finishOnboarding: (inputs, userPatch) => {
        const user = get().user;
        if (!user) return;
        const updated = useClientRecordsStore
          .getState()
          .completeOnboarding(user.id, userPatch ?? {}, inputs);
        set({
          user: { ...user, ...updated.user },
          onboardingRequired: false,
        });
      },
      updateUser: (patch) => {
        const user = get().user;
        if (!user) return;
        useClientRecordsStore.getState().updateUser(user.id, patch);
        set({ user: { ...user, ...patch } as DemoUser });
      },
      updateGoal: (goal) => {
        get().updateUser({ goal });
      },
      logout: () =>
        set({ role: null, user: null, onboardingRequired: false }),
      setHydrated: (value) => set({ hydrated: value }),
      setOnboardingRequired: (value) => set({ onboardingRequired: value }),
    }),
    {
      name: "novaturient-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function getDefaultRedirect(role: UserRole | null) {
  if (role === "dietitian") {
    return "/admin";
  }

  if (role === "client") {
    return "/dashboard";
  }

  return "/login";
}
