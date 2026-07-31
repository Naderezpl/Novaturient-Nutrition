"use client";

import Link from "next/link";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { WorkspacePlaceholder } from "@/components/workspace-placeholder";
import { Button } from "@/components/ui/button";

export default function DashboardFoodsPage() {
  return (
    <RoleGuard role="client">
      <AppShell
        role="client"
        title="Foods"
        subtitle="Browse the structured Food Groups page with categories, smaller groups, and confirmable items."
        actions={
          <Link href="/food-groups">
            <Button>Open Food Groups</Button>
          </Link>
        }
      >
        <WorkspacePlaceholder
          eyebrow="Foods"
          title="Food browsing now lives in Food Groups."
          body="Use the Food Groups page for category links, smaller sections like meats or milks, food cards, and the +1 / -1 / Confirm flow."
          primaryHref="/food-groups"
          primaryLabel="Go to Food Groups"
        />
      </AppShell>
    </RoleGuard>
  );
}
