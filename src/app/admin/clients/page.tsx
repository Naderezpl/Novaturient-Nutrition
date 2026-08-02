"use client";

import Link from "next/link";
import { useMemo } from "react";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { activityLevelLabels, goalLabels } from "@/lib/plan-calculator";
import { useClientRecordsStore } from "@/lib/client-records-store";
import { clients } from "@/lib/demo-data";
import type { ClientGoal, DemoUser } from "@/types/app";

type ListClient = {
  id: string;
  fullName: string;
  email: string;
  goal?: ClientGoal | null;
  activityLevel?: DemoUser["activityLevel"];
  source: "persisted" | "demo";
};

export default function AdminClientsPage() {
  const persisted = useClientRecordsStore((s) => s.recordsByUserId);

  const list = useMemo<ListClient[]>(() => {
    const out: ListClient[] = [];
    const seen = new Set<string>();

    for (const rec of Object.values(persisted)) {
      if (!rec || !rec.user) continue;
      const id = rec.user.id;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({
        id,
        fullName: rec.user.fullName || "Unnamed client",
        email: rec.user.email || "",
        goal: rec.user.goal ?? null,
        activityLevel: rec.user.activityLevel,
        source: "persisted",
      });
    }

    for (const client of clients) {
      if (seen.has(client.user.id)) continue;
      seen.add(client.user.id);
      out.push({
        id: client.user.id,
        fullName: client.user.fullName,
        email: client.user.email,
        goal: client.user.goal,
        activityLevel: client.user.activityLevel,
        source: "demo",
      });
    }

    return out;
  }, [persisted]);

  return (
    <RoleGuard role="dietitian">
      <AppShell
        role="dietitian"
        title="Clients"
        subtitle="Admin client list. New signups appear automatically at the top so you can review or tweak their auto-calculated exchange targets."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className="rounded-[28px] border border-white/70 bg-white/60 p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.32)] backdrop-blur-2xl transition hover:bg-white/75"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{client.fullName}</p>
                  <p className="mt-1 text-sm text-slate-500">{client.email}</p>
                </div>
                <span
                  className={
                    client.source === "persisted"
                      ? "rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-700 ring-1 ring-emerald-200"
                      : "rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 ring-1 ring-slate-200"
                  }
                >
                  {client.source === "persisted" ? "Stored" : "Demo"}
                </span>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-slate-400">
                {(client.goal ? goalLabels[client.goal] : "Goal not set") +
                  " • " +
                  (client.activityLevel
                    ? activityLevelLabels[client.activityLevel]
                    : "Activity not set")}
              </p>
            </Link>
          ))}
        </div>
      </AppShell>
    </RoleGuard>
  );
}
