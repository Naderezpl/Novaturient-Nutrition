"use client";

import Link from "next/link";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { WorkspacePlaceholder } from "@/components/workspace-placeholder";
import { ADMIN_EMAIL } from "@/lib/auth-store";

export default function AdminOverviewPage() {
  return (
    <RoleGuard role="dietitian">
      <AppShell
        role="dietitian"
        title="Admin Panel"
        subtitle="Only the Novaturient admin account can access this workspace."
        actions={
          <div className="rounded-full border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-600">
            {ADMIN_EMAIL}
          </div>
        }
      >
        <WorkspacePlaceholder
          eyebrow="Admin"
          title="Admin access is locked to one account."
          body="This admin workspace is available only to the configured Novaturient admin login. Client accounts are redirected away from admin routes."
          primaryHref="/admin/clients"
          primaryLabel="Open Clients"
        />
      </AppShell>
    </RoleGuard>
  );
}
