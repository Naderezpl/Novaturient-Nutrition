import { create } from "zustand";
import { persist } from "zustand/middleware";

import { clients, currentClient, dietitianUser } from "@/lib/demo-data";
import type { DemoUser, UserRole } from "@/types/app";

export const ADMIN_EMAIL = "novaturient.nutritionn@gmail.com";
export const ADMIN_PASSWORD = "admin";

type AuthStore = {
  hydrated: boolean;
  user: DemoUser | null;
  role: UserRole | null;
  login: (
    role: UserRole,
    email?: string,
    password?: string,
  ) => { success: boolean; role: UserRole | null; error?: string };
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
      login: (role, email, password) => {
        const normalizedEmail = email?.trim().toLowerCase();

        if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
          if (password !== ADMIN_PASSWORD) {
            return {
              success: false,
              role: null,
              error: "Wrong admin password.",
            };
          }

          set({ role: "dietitian", user: dietitianUser });
          return { success: true, role: "dietitian" };
        }

        if (role === "dietitian") {
          return {
            success: false,
            role: null,
            error: "Only the admin account can access the admin panel.",
          };
        }

        const user = findClientByEmail(normalizedEmail);
        set({ role: "client", user });
        return { success: true, role: "client" };
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
