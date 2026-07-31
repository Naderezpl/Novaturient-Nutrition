"use client";

import Link from "next/link";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { clients } from "@/lib/demo-data";

export default function AdminClientsPage() {
  return (
    <RoleGuard role="dietitian">
      <AppShell
        role="dietitian"
        title="Clients"
        subtitle="Admin-only client list."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.user.id}
              href={`/admin/clients/${client.user.id}`}
              className="rounded-[28px] border border-white/70 bg-white/60 p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.32)] backdrop-blur-2xl transition hover:bg-white/75"
            >
              <p className="text-sm font-semibold text-slate-900">{client.user.fullName}</p>
              <p className="mt-1 text-sm text-slate-500">{client.user.email}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-400">
                {client.user.goal?.replace("_", " ")} • {client.user.activityLevel}
              </p>
            </Link>
          ))}
        </div>
      </AppShell>
    </RoleGuard>
  );
}
