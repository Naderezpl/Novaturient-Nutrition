"use client";

import Link from "next/link";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { WorkspacePlaceholder } from "@/components/workspace-placeholder";

export default function AdminOverviewPage() {
  return (
    <RoleGuard role="dietitian">
      <AppShell
        role="dietitian"
        title="Admin Panel"
        subtitle="Only the Novaturient admin account can access this workspace."
        actions={
          <Link href="/admin/clients">
            <Button variant="secondary">Open Clients</Button>
          </Link>
        }
      >
        <WorkspacePlaceholder
          eyebrow="Admin"
          title="Admin access is locked to one account."
          body="This admin workspace is available only to the configured Novaturient admin login. Client accounts are redirected away from admin routes."
          primaryHref="/admin/clients"
          primaryLabel="Manage Clients"
        />
      </AppShell>
    </RoleGuard>
  );
}
