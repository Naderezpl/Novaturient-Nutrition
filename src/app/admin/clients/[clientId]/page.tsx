"use client";

import { useParams } from "next/navigation";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { WorkspacePlaceholder } from "@/components/workspace-placeholder";
import { clients } from "@/lib/demo-data";

export default function AdminClientDetailPage() {
  const params = useParams<{ clientId: string }>();
  const client = clients.find((item) => item.user.id === params.clientId) ?? clients[0];

  return (
    <RoleGuard role="dietitian">
      <AppShell
        role="dietitian"
        title={client.user.fullName}
        subtitle="Client detail route is active and admin-only."
      >
        <WorkspacePlaceholder
          eyebrow="Client Detail"
          title={client.user.email}
          body={`Goal: ${client.user.goal?.replace("_", " ")} • Activity: ${client.user.activityLevel} • Water goal: ${client.waterGoalMl} ml`}
        />
      </AppShell>
    </RoleGuard>
  );
}
