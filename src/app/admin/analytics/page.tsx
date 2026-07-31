"use client";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { WorkspacePlaceholder } from "@/components/workspace-placeholder";

export default function AdminAnalyticsPage() {
  return (
    <RoleGuard role="dietitian">
      <AppShell
        role="dietitian"
        title="Analytics"
        subtitle="Admin analytics route placeholder so the panel opens without errors."
      >
        <WorkspacePlaceholder
          eyebrow="Analytics"
          title="Analytics route is live."
          body="This page now exists for the admin account, so dashboard navigation and search stay clean while analytics widgets are added."
        />
      </AppShell>
    </RoleGuard>
  );
}
