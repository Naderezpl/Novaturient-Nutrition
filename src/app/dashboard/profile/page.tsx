"use client";

import { useAuthStore } from "@/lib/auth-store";
import { getClientRecordForEmail } from "@/lib/demo-data";
import { AppShell, RoleGuard } from "@/components/app-shell";
import { WorkspacePlaceholder } from "@/components/workspace-placeholder";

export default function DashboardProfilePage() {
  const user = useAuthStore((state) => state.user);
  const client = getClientRecordForEmail(user?.email);

  return (
    <RoleGuard role="client">
      <AppShell
        role="client"
        title="Profile"
        subtitle="Client account details based on the currently logged-in record."
      >
        <WorkspacePlaceholder
          eyebrow="Profile"
          title={client.user.fullName}
          body={`Email: ${client.user.email} • Goal: ${client.user.goal?.replace("_", " ")} • Activity: ${client.user.activityLevel}`}
        />
      </AppShell>
    </RoleGuard>
  );
}
