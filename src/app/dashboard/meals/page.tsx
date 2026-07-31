"use client";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { WorkspacePlaceholder } from "@/components/workspace-placeholder";

export default function DashboardMealsPage() {
  return (
    <RoleGuard role="client">
      <AppShell
        role="client"
        title="Meals"
        subtitle="Meal builder page placeholder so the workspace opens cleanly while the full builder is being finished."
      >
        <WorkspacePlaceholder
          eyebrow="Meals"
          title="Meal builder is ready for the next pass."
          body="This page no longer 404s. The full meal builder can be wired here next without breaking the rest of the workspace."
        />
      </AppShell>
    </RoleGuard>
  );
}
