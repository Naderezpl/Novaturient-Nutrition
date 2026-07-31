"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Droplets, Target, UserRound, Weight, BookOpen } from "lucide-react";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";
import { useClientSnapshotStore } from "@/lib/client-snapshot-store";
import { getClientRecordForEmail } from "@/lib/demo-data";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const client = getClientRecordForEmail(user?.email);
  const allSnapshotItems = useClientSnapshotStore((state) => state.items);
  const snapshotItems = useMemo(
    () => (!user ? [] : allSnapshotItems.filter((item) => item.userId === user.id)),
    [allSnapshotItems, user],
  );

  return (
    <RoleGuard role="client">
      <AppShell
        role="client"
        title={`${client.user.fullName}'s Dashboard`}
        subtitle="Your dashboard is based on the account currently logged in, including your plan, progress, and confirmed Food Groups selections."
        actions={
          <Link href="/food-groups">
            <Button>
              <BookOpen className="h-4 w-4" />
              Open Food Groups
            </Button>
          </Link>
        }
      >
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={<UserRound className="h-5 w-5" />}
              label="Client"
              value={client.user.fullName}
              detail={client.user.email}
            />
            <MetricCard
              icon={<Target className="h-5 w-5" />}
              label="Goal"
              value={client.user.goal?.replace("_", " ") ?? "Not set"}
              detail={`Activity: ${client.user.activityLevel ?? "Not set"}`}
            />
            <MetricCard
              icon={<Weight className="h-5 w-5" />}
              label="Weight"
              value={`${client.user.weightKg ?? "--"} kg`}
              detail={`Height: ${client.user.heightCm ?? "--"} cm`}
            />
            <MetricCard
              icon={<Droplets className="h-5 w-5" />}
              label="Water goal"
              value={`${client.waterGoalMl} ml`}
              detail={`${snapshotItems.length} confirmed food group item${snapshotItems.length === 1 ? "" : "s"}`}
            />
          </section>

          <section className="rounded-[32px] border border-white/70 bg-white/60 p-6 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">Confirmed from Food Groups</p>
                <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-slate-900">
                  Dashboard snapshot
                </h2>
              </div>
              <Link href="/food-groups">
                <Button variant="secondary">Manage items</Button>
              </Link>
            </div>

            {snapshotItems.length ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {snapshotItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] border border-white/70 bg-white/78 p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.3)]"
                  >
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.categoryLabel} • {item.subcategory}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                      <span>{item.quantity} confirmed</span>
                      <span>{item.serving}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-slate-500">
                Nothing has been confirmed yet. Open the Food Groups tab and use the
                `+1 / -1 / Confirm` controls to add items here.
              </p>
            )}
          </section>
        </div>
      </AppShell>
    </RoleGuard>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/60 p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.32)] backdrop-blur-2xl">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,rgba(237,232,245,0.95),rgba(229,231,237,0.88))] text-slate-800">
        {icon}
      </div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}
