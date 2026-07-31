"use client";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { WorkspacePlaceholder } from "@/components/workspace-placeholder";

export default function DashboardLearnPage() {
  return (
    <RoleGuard role="client">
      <AppShell
        role="client"
        title="Learn"
        subtitle="Learning route placeholder so lessons open from navigation and search without a 404."
      >
        <WorkspacePlaceholder
          eyebrow="Learning"
          title="Learning Center route is active."
          body="This route now exists, so navigation and search results stay clean. The full lesson library can be expanded here next."
        />
      </AppShell>
    </RoleGuard>
  );
}
