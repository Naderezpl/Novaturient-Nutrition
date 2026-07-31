"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { useAuthStore } from "@/lib/auth-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  useAuthStore((state) => state.hydrated);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
