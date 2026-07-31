import { create } from "zustand";
import { persist } from "zustand/middleware";

import { clients, currentClient, dietitianUser } from "@/lib/demo-data";
import type { DemoUser, UserRole } from "@/types/app";

type AuthStore = {
  hydrated: boolean;
  user: DemoUser | null;
  role: UserRole | null;
  login: (role: UserRole, email?: string) => void;
  signupClient: (fullName: string, email: string) => void;
  logout: () => void;
  setHydrated: (value: boolean) => void;
};

function findClientByEmail(email?: string) {
  if (!email) {
    return currentClient.user;
  }

  return clients.find((client) => client.user.email === email)?.user ?? currentClient.user;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      hydrated: false,
      user: null,
      role: null,
      login: (role, email) => {
        const user = role === "dietitian" ? dietitianUser : findClientByEmail(email);
        set({ role, user });
      },
      signupClient: (fullName, email) => {
        set({
          role: "client",
          user: {
            ...currentClient.user,
            id: "client-new",
            fullName,
            email,
            role: "client",
          },
        });
      },
      logout: () => set({ role: null, user: null }),
      setHydrated: (value) => set({ hydrated: value }),
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
