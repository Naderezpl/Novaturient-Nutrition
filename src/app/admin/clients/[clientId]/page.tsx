"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Activity,
  ArrowLeft,
  Droplets,
  Edit3,
  Save,
  Target,
  UserRound,
  Weight,
} from "lucide-react";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { categoryLabels, clients } from "@/lib/demo-data";
import { exchangeOrder } from "@/lib/exchanges";
import {
  useClientRecordsStore,
  type PersistedClientRecord,
} from "@/lib/client-records-store";
import {
  activityLevelLabels,
  calculateBmi,
  goalLabels,
} from "@/lib/plan-calculator";
import type { ClientRecord, ExchangePlan } from "@/types/app";
import { cn } from "@/lib/utils";

type Resolved = {
  source: "demo" | "persisted";
  record: ClientRecord;
  persisted?: PersistedClientRecord;
};

function resolveClient(clientId: string): Resolved {
  const byUserId = useClientRecordsStore.getState().recordsByUserId[clientId];
  if (byUserId) {
    return {
      source: "persisted",
      record: {
        user: byUserId.user,
        plan: byUserId.plan,
        adherence: byUserId.adherence,
        recentMeals: byUserId.recentMeals,
        waterGoalMl: byUserId.waterGoalMl,
      },
      persisted: byUserId,
    };
  }

  // Search across persisted by id prefix match
  for (const [uid, rec] of Object.entries(
    useClientRecordsStore.getState().recordsByUserId,
  )) {
    if (uid === clientId || rec.user.id === clientId) {
      return {
        source: "persisted",
        record: {
          user: rec.user,
          plan: rec.plan,
          adherence: rec.adherence,
          recentMeals: rec.recentMeals,
          waterGoalMl: rec.waterGoalMl,
        },
        persisted: rec,
      };
    }
  }

  const demo = clients.find((c) => c.user.id === clientId) ?? clients[0];
  return { source: "demo", record: demo };
}

const waterSchema = z.object({
  waterGoalMl: z.coerce
    .number()
    .int()
    .min(500, "Water must be at least 500 ml")
    .max(8000, "Water must be 8000 ml or less"),
});

type WaterFormValues = z.input<typeof waterSchema>;
type WaterFormSubmit = z.output<typeof waterSchema>;

export default function AdminClientDetailPage() {
  const params = useParams<{ clientId: string }>();
  const initial = useMemo(() => resolveClient(params.clientId), [params.clientId]);
  const persisted = initial.persisted;
  const client = initial.record;

  const updatePlan = useClientRecordsStore((s) => s.updatePlan);
  const updateWater = useClientRecordsStore((s) => s.updateWaterGoal);
  const updateUser = useClientRecordsStore((s) => s.updateUser);

  const [planDraft, setPlanDraft] = useState<ExchangePlan>(client.plan);
  const [planEditing, setPlanEditing] = useState(false);
  const planDirty = exchangeOrder.some((c) => planDraft[c] !== client.plan[c]);

  const defaultWater = Math.max(500, Math.min(8000, client.waterGoalMl));
  const waterForm = useForm<WaterFormValues, unknown, WaterFormSubmit>({
    resolver: zodResolver(waterSchema),
    defaultValues: { waterGoalMl: defaultWater },
    values: { waterGoalMl: client.waterGoalMl },
  });

  const bmi =
    client.user.heightCm && client.user.weightKg
      ? calculateBmi(client.user.weightKg, client.user.heightCm)
      : null;

  const persistable = !!persisted;

  return (
    <RoleGuard role="dietitian">
      <AppShell
        role="dietitian"
        title={client.user.fullName}
        subtitle="Edit exchange targets and water goal. Your changes appear immediately for the client across their dashboard, food groups, and coach prompt ideas."
        actions={
          <Link href="/admin/clients">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to clients
            </Button>
          </Link>
        }
      >
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={<UserRound className="h-5 w-5" />}
              label="Client"
              value={client.user.fullName}
              detail={client.user.email}
            />
            <Metric
              icon={<Target className="h-5 w-5" />}
              label="Goal"
              value={client.user.goal ? goalLabels[client.user.goal] : "Not set"}
              detail={
                client.user.activityLevel
                  ? activityLevelLabels[client.user.activityLevel]
                  : "Activity not set"
              }
            />
            <Metric
              icon={<Weight className="h-5 w-5" />}
              label="Body snapshot"
              value={`${client.user.weightKg ?? "–"} kg · ${client.user.heightCm ?? "–"} cm`}
              detail={
                [
                  client.user.age ? `${client.user.age} yr` : null,
                  client.user.sex ?? null,
                  bmi ? `BMI ${bmi}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Not set"
              }
            />
            <Metric
              icon={<Droplets className="h-5 w-5" />}
              label="Water goal"
              value={`${client.waterGoalMl} ml`}
              detail={
                client.adherence.length
                  ? `Weekly avg ${Math.round(
                      client.adherence.reduce((s, p) => s + p.waterMl, 0) /
                        client.adherence.length,
                    )} ml`
                  : "No adherence history yet"
              }
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardDescription>
                      Exchange targets ({initial.source === "persisted"
                        ? "persisted client — edits save instantly"
                        : "demo client — open in local dashboard first to enable persisted edits"})
                    </CardDescription>
                    <CardTitle className="text-2xl">
                      Daily servings for the client
                    </CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!planEditing ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPlanEditing(true)}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit servings
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setPlanDraft(client.plan);
                            setPlanEditing(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={!persistable || !planDirty}
                          onClick={() => {
                            if (!persisted) return;
                            updatePlan(persisted.user.id, planDraft);
                            setPlanEditing(false);
                          }}
                        >
                          <Save className="h-3.5 w-3.5" />
                          Save for client
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {exchangeOrder.map((category) => (
                    <div
                      key={category}
                      className={cn(
                        "rounded-[22px] border border-white/70 bg-white/80 p-4 ring-1 ring-white/70",
                      )}
                    >
                      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
                        {categoryLabels[category]}
                      </p>
                      {planEditing ? (
                        <Input
                          className="mt-2"
                          type="number"
                          min={0}
                          step={1}
                          value={planDraft[category]}
                          onChange={(e) =>
                            setPlanDraft({
                              ...planDraft,
                              [category]: Math.max(
                                0,
                                Number(e.target.value) || 0,
                              ),
                            })
                          }
                        />
                      ) : (
                        <p className="mt-1.5 text-3xl font-semibold text-slate-900">
                          {client.plan[category]}
                          <span className="ml-1.5 text-sm font-normal text-slate-500">
                            servings
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardDescription>Client record details</CardDescription>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow
                  icon={<UserRound className="h-4 w-4" />}
                  label="User id"
                  value={client.user.id}
                />
                <DetailRow
                  icon={<Target className="h-4 w-4" />}
                  label="Source"
                  value={
                    initial.source === "persisted"
                      ? "Persisted (signup or completed onboarding)"
                      : "Demo dataset"
                  }
                />
                <DetailRow
                  icon={<Activity className="h-4 w-4" />}
                  label="Onboarding"
                  value={
                    persisted?.onboardingCompleted
                      ? "Completed"
                      : "Not completed yet"
                  }
                />
                <DetailRow
                  icon={<Droplets className="h-4 w-4" />}
                  label="Adherence (weekly avg)"
                  value={
                    client.adherence.length
                      ? `${Math.round(
                          client.adherence.reduce((s, p) => s + p.adherence, 0) /
                            client.adherence.length,
                        )}%`
                      : "—"
                  }
                />
                <DetailRow
                  icon={<UserRound className="h-4 w-4" />}
                  label="Join date"
                  value={client.user.joinDate ?? "—"}
                />

                <div className="mt-5 rounded-[24px] border border-white/70 bg-white/70 p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                    Dietitian water adjustment
                  </p>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Updates water goal shown in the client dashboard.
                  </p>
                  <form
                    className="mt-3 flex flex-wrap gap-2"
                    onSubmit={waterForm.handleSubmit((v) => {
                      if (!persisted) return;
                      updateWater(persisted.user.id, v.waterGoalMl);
                      // Also bump user weight/age goal if dirty later
                      if (client.user.goal) updateUser(persisted.user.id, {});
                    })}
                  >
                    <Input
                      type="number"
                      className="max-w-[200px]"
                      {...waterForm.register("waterGoalMl")}
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      disabled={!persistable}
                    >
                      <Save className="h-3.5 w-3.5" />
                      Save water
                    </Button>
                  </form>
                  <p className="mt-2 text-xs text-rose-500">
                    {waterForm.formState.errors.waterGoalMl?.message}
                  </p>
                  {!persistable && (
                    <p className="mt-2 text-xs text-slate-500">
                      Demo clients don&apos;t save edits. To persist, create a new client via the public signup flow so their record is stored under the novaturient-client-records bucket.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </AppShell>
    </RoleGuard>
  );
}

function Metric({
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
      <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2.5">
      <div className="flex items-center gap-2 text-slate-500">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/80 text-slate-700 ring-1 ring-white/70">
          {icon}
        </span>
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-right text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
