"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  Droplets,
  Flame,
  Pencil,
  Target,
  TrendingUp,
  UserRound,
  UtensilsCrossed,
  Weight,
} from "lucide-react";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth-store";
import { useClientRecordsStore } from "@/lib/client-records-store";
import { useClientSnapshotStore } from "@/lib/client-snapshot-store";
import { categoryLabels, clients } from "@/lib/demo-data";
import { exchangeOrder, getConsumedExchanges } from "@/lib/exchanges";
import {
  activityLevelLabels,
  calculateBmi,
  calculateTargetCalories,
  goalLabels,
  type OnboardingInputs,
} from "@/lib/plan-calculator";
import { cn } from "@/lib/utils";
import type { ClientRecord, ExchangeCategory, ExchangePlan } from "@/types/app";

function PlanCard({
  category,
  total,
  consumed,
  tint,
}: {
  category: ExchangeCategory;
  total: number;
  consumed: number;
  tint: string;
}) {
  const pct = Math.min(100, Math.round((consumed / Math.max(1, total)) * 100));
  const remaining = Math.max(0, total - consumed);
  const over = consumed > total;
  return (
    <div
      className={cn(
        "rounded-[22px] border border-white/70 p-4 ring-1 ring-white/70",
        "bg-gradient-to-br",
        tint,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
          {categoryLabels[category]}
        </p>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium",
            over
              ? "bg-rose-100 text-rose-700"
              : "bg-white/70 text-slate-600",
          )}
        >
          {over ? `+${consumed - total} over` : `${remaining} left`}
        </span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <p className="text-3xl font-semibold text-slate-900">{consumed}</p>
        <span className="text-sm text-slate-500">/ {total} servings</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            over
              ? "bg-gradient-to-r from-rose-400 to-rose-500"
              : "bg-gradient-to-r from-slate-700 to-slate-800",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const allSnapshotItems = useClientSnapshotStore((state) => state.items);
  const snapshotItems = useMemo(
    () => (!user ? [] : allSnapshotItems.filter((item) => item.userId === user.id)),
    [allSnapshotItems, user],
  );
  const persisted = useClientRecordsStore((state) =>
    user ? state.getRecord(user) : null,
  );
  const updatePlan = useClientRecordsStore((state) => state.updatePlan);

  const fallbackClient: ClientRecord = persisted
    ? {
        user: persisted.user,
        plan: persisted.plan,
        adherence: persisted.adherence,
        recentMeals: persisted.recentMeals,
        waterGoalMl: persisted.waterGoalMl,
      }
    : clients.find((c) => c.user.email === user?.email) ?? clients[4];

  const client = persisted
    ? { user: { ...fallbackClient.user, ...persisted.user }, plan: persisted.plan, waterGoalMl: persisted.waterGoalMl, adherence: persisted.adherence, recentMeals: persisted.recentMeals }
    : fallbackClient;

  const plan: ExchangePlan = client.plan;
  const consumed = useMemo(() => {
    const fromSnapshots = snapshotItems.reduce<ExchangePlan>(
      (acc, item) => {
        acc[item.category] += item.quantity * item.exchanges;
        return acc;
      },
      { starch: 0, fruit: 0, vegetable: 0, protein: 0, dairy: 0, fat: 0 },
    );
    const fromMeals = getConsumedExchanges(client.recentMeals ?? []);
    return exchangeOrder.reduce<ExchangePlan>((acc, cat) => {
      acc[cat] = +(fromSnapshots[cat] + fromMeals[cat]).toFixed(1);
      return acc;
    }, { starch: 0, fruit: 0, vegetable: 0, protein: 0, dairy: 0, fat: 0 });
  }, [snapshotItems, client.recentMeals]);

  const bmi = client.user.heightCm && client.user.weightKg
    ? calculateBmi(client.user.weightKg, client.user.heightCm)
    : null;

  const onboardingInputs: OnboardingInputs | null =
    persisted?.onboardingInputs ??
    (client.user.age && client.user.heightCm && client.user.weightKg && client.user.activityLevel && client.user.goal
      ? {
          sex: client.user.sex ?? "female",
          ageYears: client.user.age,
          heightCm: client.user.heightCm,
          weightKg: client.user.weightKg,
          activityLevel: client.user.activityLevel,
          goal: client.user.goal,
        }
      : null);
  const targetKcal = onboardingInputs ? calculateTargetCalories(onboardingInputs) : null;

  const categoryTint: Record<ExchangeCategory, string> = {
    starch: "from-rose-100/80 to-orange-100/80",
    fruit: "from-amber-100/90 to-pink-100/80",
    vegetable: "from-emerald-100/90 to-lime-100/80",
    protein: "from-sky-100/90 to-cyan-100/80",
    dairy: "from-violet-100/90 to-fuchsia-100/70",
    fat: "from-stone-200/90 to-yellow-100/70",
  };

  const totalServings = exchangeOrder.reduce((n, c) => n + plan[c], 0);
  const totalConsumed = exchangeOrder.reduce((n, c) => n + consumed[c], 0);
  const adherencePct = Math.round((totalConsumed / Math.max(1, totalServings)) * 100);

  const editModeInit = useMemo(
    () => exchangeOrder.reduce<ExchangePlan>((acc, c) => {
      acc[c] = plan[c];
      return acc;
    }, { starch: 0, fruit: 0, vegetable: 0, protein: 0, dairy: 0, fat: 0 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plan.starch, plan.fruit, plan.vegetable, plan.protein, plan.dairy, plan.fat],
  );

  return (
    <RoleGuard role="client">
      <AppShell
        role="client"
        title={`${client.user.fullName}'s Dashboard`}
        subtitle="Your exchange plan is auto-calculated from your body and goal, and can be fine-tuned by your dietitian from their workspace."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/profile">
              <Button variant="secondary">
                <UserRound className="h-4 w-4" />
                Profile
              </Button>
            </Link>
            <Link href="/food-groups">
              <Button>
                <BookOpen className="h-4 w-4" />
                Open Food Groups
              </Button>
            </Link>
          </div>
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
              value={client.user.goal ? goalLabels[client.user.goal] : "Not set"}
              detail={`Activity: ${
                client.user.activityLevel
                  ? activityLevelLabels[client.user.activityLevel]
                  : "Not set"
              }`}
            />
            <MetricCard
              icon={<Weight className="h-5 w-5" />}
              label="Weight / Height"
              value={`${client.user.weightKg ?? "--"} kg · ${client.user.heightCm ?? "--"} cm`}
              detail={
                [
                  client.user.age ? `${client.user.age} yr` : null,
                  client.user.sex ? client.user.sex : null,
                  bmi ? `BMI ${bmi}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Body details will update after onboarding."
              }
            />
            <MetricCard
              icon={<Droplets className="h-5 w-5" />}
              label="Water goal"
              value={`${client.waterGoalMl} ml`}
              detail={`${snapshotItems.length} confirmed food group item${snapshotItems.length === 1 ? "" : "s"}`}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardDescription>
                    Daily exchange plan · single source of truth across the app
                  </CardDescription>
                  <CardTitle className="text-2xl">
                    Today&apos;s servings
                  </CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {targetKcal !== null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-slate-600 ring-1 ring-white/70">
                      <Flame className="h-3.5 w-3.5" />
                      ~{targetKcal} kcal
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-slate-600 ring-1 ring-white/70">
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                    {totalServings} servings total
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-slate-600 ring-1 ring-white/70">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {Math.min(100, adherencePct)}% consumed
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {exchangeOrder.map((category) => (
                    <PlanCard
                      key={category}
                      category={category}
                      total={plan[category]}
                      consumed={consumed[category]}
                      tint={categoryTint[category]}
                    />
                  ))}
                </div>
                <EditablePlanEditor
                  initial={editModeInit}
                  onSave={(nextPlan) => {
                    if (!user) return;
                    updatePlan(user.id, nextPlan);
                    if (persisted && !persisted.onboardingCompleted) {
                      // best effort sync
                    }
                  }}
                  dietitianLabel="Dietitians can edit these targets from their client workspace. Use this to preview adjustments locally."
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardDescription>Body snapshot</CardDescription>
                <CardTitle>Quick stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <MiniRow
                  icon={<Activity className="h-4 w-4" />}
                  label="Activity"
                  value={
                    client.user.activityLevel
                      ? activityLevelLabels[client.user.activityLevel]
                      : "—"
                  }
                />
                <MiniRow
                  icon={<Target className="h-4 w-4" />}
                  label="Goal"
                  value={
                    client.user.goal ? goalLabels[client.user.goal] : "—"
                  }
                />
                <MiniRow
                  icon={<Weight className="h-4 w-4" />}
                  label="Weight trend (7d)"
                  value={
                    client.adherence?.length
                      ? `${client.adherence[0].weightKg} → ${client.adherence[client.adherence.length - 1].weightKg} kg`
                      : "—"
                  }
                />
                <MiniRow
                  icon={<Droplets className="h-4 w-4" />}
                  label="Water (weekly avg)"
                  value={
                    client.adherence?.length
                      ? `${Math.round(client.adherence.reduce((s, p) => s + p.waterMl, 0) / client.adherence.length)} ml`
                      : "—"
                  }
                />
                <MiniRow
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Adherence (weekly avg)"
                  value={
                    client.adherence?.length
                      ? `${Math.round(client.adherence.reduce((s, p) => s + p.adherence, 0) / client.adherence.length)}%`
                      : "—"
                  }
                />
                <MiniRow
                  icon={<UserRound className="h-4 w-4" />}
                  label="Joined"
                  value={client.user.joinDate ?? "Today"}
                />
                {client.recentMeals?.length ? (
                  <div className="mt-4 rounded-[24px] border border-white/70 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                      Recent meals ({client.recentMeals.length})
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {client.recentMeals.slice(0, 3).map((meal) => (
                        <li
                          key={meal.id}
                          className="flex items-start justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2"
                        >
                          <span className="font-medium capitalize text-slate-900">
                            {meal.mealType}
                          </span>
                          <span className="text-right text-xs text-slate-500">
                            {meal.foods.join(", ")}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/dashboard/meals"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-700 underline underline-offset-4 hover:text-slate-900"
                    >
                      Open meal builder →
                    </Link>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </section>

          <section className="rounded-[32px] border border-white/70 bg-white/60 p-6 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">
                  Confirmed from Food Groups
                </p>
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
                <code className="mx-1 rounded bg-white/70 px-1.5 py-0.5 text-[11px] text-slate-700">+1 / -1 / Confirm</code>
                controls to add items here.
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

function MiniRow({
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

function EditablePlanEditor({
  initial,
  onSave,
  dietitianLabel,
}: {
  initial: ExchangePlan;
  onSave: (next: ExchangePlan) => void;
  dietitianLabel: string;
}) {
  const [draft, setDraft] = useState<ExchangePlan>(initial);
  const [editing, setEditing] = useState(false);

  const dirty = exchangeOrder.some((c) => draft[c] !== initial[c]);

  return (
    <div className="mt-6 rounded-[26px] border border-white/70 bg-white/65 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            Plan editor
          </p>
          <p className="mt-1 text-sm text-slate-500">{dietitianLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!editing ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDraft(initial);
                setEditing(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit servings
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDraft(initial);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!dirty}
                onClick={() => {
                  onSave(draft);
                  setEditing(false);
                }}
              >
                Save targets
              </Button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {exchangeOrder.map((cat) => (
            <label
              key={cat}
              className="rounded-2xl border border-white/70 bg-white/75 p-3 text-sm"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {categoryLabels[cat]}
              </span>
              <Input
                className="mt-2"
                type="number"
                min={0}
                step={1}
                value={draft[cat]}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [cat]: Math.max(0, Number(e.target.value) || 0),
                  })
                }
              />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// End of dashboard page
