"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Droplets,
  HeartPulse,
  Scale,
  Sparkles,
  Target,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth-store";
import { useClientRecordsStore } from "@/lib/client-records-store";
import {
  activityLevelLabels,
  calculateBmi,
  calculateExchangePlan,
  calculateTargetCalories,
  calculateWaterGoalMl,
  goalLabels,
  type OnboardingInputs,
} from "@/lib/plan-calculator";
import type {
  ActivityLevel,
  ClientGoal,
  DemoUser,
  ExchangeCategory,
} from "@/types/app";
import { exchangeOrder } from "@/lib/exchanges";

const schema = z
  .object({
    sex: z.enum(["female", "male"]),
    ageYears: z.coerce
      .number()
      .int()
      .min(10, "Age must be at least 10")
      .max(110, "Age must be 110 or less"),
    heightCm: z.coerce
      .number()
      .min(100, "Height must be at least 100 cm")
      .max(250, "Height must be 250 cm or less"),
    weightKg: z.coerce
      .number()
      .min(25, "Weight must be at least 25 kg")
      .max(350, "Weight must be 350 kg or less"),
    activityLevel: z.enum([
      "sedentary",
      "light",
      "moderate",
      "active",
      "very_active",
    ]),
    goal: z.enum(["fat_loss", "maintenance", "muscle_gain"]),
    bodyFatPct: z.coerce
      .number()
      .min(3, "Body fat must be at least 3%")
      .max(70, "Body fat must be 70% or less")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.bodyFatPct !== undefined &&
      Number.isNaN(Number(data.bodyFatPct))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "If provided, body fat must be a number",
        path: ["bodyFatPct"],
      });
    }
  });

type FormValues = z.input<typeof schema>;
type SubmittedValues = z.output<typeof schema>;

const categoryMeta: Record<
  ExchangeCategory,
  { label: string; accent: string }
> = {
  starch: { label: "Starch", accent: "from-rose-100 to-orange-100" },
  fruit: { label: "Fruit", accent: "from-amber-100 to-pink-100" },
  vegetable: { label: "Vegetable", accent: "from-emerald-100 to-lime-100" },
  protein: { label: "Protein", accent: "from-sky-100 to-cyan-100" },
  dairy: { label: "Dairy", accent: "from-violet-100 to-fuchsia-100" },
  fat: { label: "Fat", accent: "from-stone-100 to-yellow-100" },
};

const goalOptions: { value: ClientGoal; label: string }[] = Object.entries(
  goalLabels,
).map(([value, label]) => ({
  value: value as ClientGoal,
  label,
}));

const activityOptions: { value: ActivityLevel; label: string }[] = Object.entries(
  activityLevelLabels,
).map(([value, label]) => ({
  value: value as ActivityLevel,
  label,
}));

function ChipGroup<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-slate-500">{label}</label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={
                "rounded-2xl border px-4 py-3 text-left text-sm transition " +
                (active
                  ? "border-white bg-[#ede8f5] text-slate-900 shadow-sm"
                  : "border-white/60 bg-white/60 text-slate-600 hover:bg-white/80")
              }
            >
              <p className="font-medium text-slate-900">{opt.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OnboardingModal() {
  const user = useAuthStore((state) => state.user);
  const finishOnboarding = useAuthStore((state) => state.finishOnboarding);
  const updateUser = useAuthStore((state) => state.updateUser);
  const persisted = useClientRecordsStore((state) =>
    user ? state.getRecord(user) : null,
  );

  const [step, setStep] = useState<1 | 2>(1);

  const defaultValues: FormValues = useMemo(() => {
    const existing = persisted?.onboardingInputs;
    const demo = user as DemoUser | null | undefined;
    return {
      sex: existing?.sex ?? demo?.sex ?? "female",
      ageYears: existing?.ageYears ?? demo?.age ?? 28,
      heightCm: existing?.heightCm ?? demo?.heightCm ?? 165,
      weightKg: existing?.weightKg ?? demo?.weightKg ?? 68,
      activityLevel:
        (existing?.activityLevel as ActivityLevel) ??
        demo?.activityLevel ??
        "light",
      goal:
        (existing?.goal as ClientGoal) ?? demo?.goal ?? "maintenance",
      bodyFatPct: existing?.bodyFatPct,
    };
  }, [persisted, user]);

  const form = useForm<FormValues, unknown, SubmittedValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  });
  const values = useWatch({ control: form.control });
  const selectedSex = values.sex ?? defaultValues.sex;
  const selectedGoal = values.goal ?? defaultValues.goal;
  const selectedActivityLevel =
    values.activityLevel ?? defaultValues.activityLevel;
  const previewInputs: OnboardingInputs | null = useMemo(() => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return null;
    const v = parsed.data;
    return {
      sex: v.sex,
      ageYears: v.ageYears,
      heightCm: v.heightCm,
      weightKg: v.weightKg,
      activityLevel: v.activityLevel,
      goal: v.goal,
      bodyFatPct: v.bodyFatPct,
    } as OnboardingInputs;
  }, [values]);

  const previewPlan = previewInputs
    ? calculateExchangePlan(previewInputs)
    : null;
  const previewCalories = previewInputs
    ? calculateTargetCalories(previewInputs)
    : null;
  const previewWater = previewInputs
    ? calculateWaterGoalMl(previewInputs)
    : null;
  const previewBmi =
    previewInputs ? calculateBmi(previewInputs.weightKg, previewInputs.heightCm) : null;

  const onSubmitStep1 = () => {
    const required: (keyof FormValues)[] = [
      "sex",
      "ageYears",
      "heightCm",
      "weightKg",
      "activityLevel",
      "goal",
    ];
    let hasError = false;
    required.forEach((key) => {
      const err = form.formState.errors[key];
      if (err) hasError = true;
    });
    const parsed = schema.safeParse(form.getValues());
    if (!parsed.success || hasError) {
      form.trigger(required);
      return;
    }
    setStep(2);
  };

  const onFinalize = () => {
    const parsed = schema.safeParse(form.getValues());
    if (!parsed.success) {
      form.trigger();
      setStep(1);
      return;
    }
    const v = parsed.data;
    const inputs: OnboardingInputs = {
      sex: v.sex,
      ageYears: v.ageYears,
      heightCm: v.heightCm,
      weightKg: v.weightKg,
      activityLevel: v.activityLevel,
      goal: v.goal,
      bodyFatPct: v.bodyFatPct,
    };
    updateUser({
      sex: v.sex,
      age: v.ageYears,
      heightCm: v.heightCm,
      weightKg: v.weightKg,
      activityLevel: v.activityLevel,
      goal: v.goal,
    });
    finishOnboarding(inputs);
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[34px] border border-white/70 bg-white/80 shadow-2xl backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-72 w-[720px] -translate-x-1/2 rounded-full bg-[conic-gradient(from_220deg,rgba(237,232,245,0.9),rgba(229,231,237,0.6),rgba(237,232,245,0.95))] opacity-80 blur-3xl" />
        </div>
        <div className="flex items-start justify-between gap-4 border-b border-white/60 px-6 py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-slate-500">
              <Sparkles className="h-3.5 w-3.5" />
              Step {step} of 2 · Complete setup to unlock your plan
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-slate-900">
              Welcome, {user.fullName.split(" ")[0]} 👋
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              This quick questionnaire builds a starting exchange plan tailored
              to your body and goal. Your dietitian can fine-tune anything later
              from their workspace.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-2xl bg-[#ede8f5]/80 px-3 py-2 text-xs text-slate-600 sm:flex">
            <LockIcon className="h-3.5 w-3.5" />
            Required · Cannot skip
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 1) onSubmitStep1();
            else onFinalize();
          }}
          className="max-h-[calc(92vh-210px)] space-y-6 overflow-y-auto px-6 py-6"
        >
          {step === 1 && (
            <div className="grid gap-5 md:grid-cols-2">
              <ChipGroup
                label="Sex"
                value={selectedSex}
                onChange={(v) => form.setValue("sex", v, { shouldValidate: true })}
                options={[
                  { value: "female", label: "Female" },
                  { value: "male", label: "Male" },
                ] as const}
              />
              <ChipGroup
                label="Primary goal"
                value={selectedGoal}
                onChange={(v) => form.setValue("goal", v, { shouldValidate: true })}
                options={goalOptions}
              />

              <div className="space-y-2 md:col-span-1">
                <label className="text-sm text-slate-500">Age (years)</label>
                <Input
                  type="number"
                  min={10}
                  max={110}
                  {...form.register("ageYears")}
                />
                <p className="text-xs text-rose-500">
                  {form.formState.errors.ageYears?.message}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-500">
                  Body fat % (optional, improves accuracy)
                </label>
                <Input
                  type="number"
                  min={3}
                  max={70}
                  step="0.1"
                  placeholder="e.g. 22"
                  {...form.register("bodyFatPct")}
                />
                <p className="text-xs text-rose-500">
                  {form.formState.errors.bodyFatPct?.message}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-500">Height (cm)</label>
                <Input
                  type="number"
                  min={100}
                  max={250}
                  step="0.1"
                  {...form.register("heightCm")}
                />
                <p className="text-xs text-rose-500">
                  {form.formState.errors.heightCm?.message}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-500">Weight (kg)</label>
                <Input
                  type="number"
                  min={25}
                  max={350}
                  step="0.1"
                  {...form.register("weightKg")}
                />
                <p className="text-xs text-rose-500">
                  {form.formState.errors.weightKg?.message}
                </p>
              </div>

              <div className="md:col-span-2">
                <ChipGroup
                  label="Activity level"
                  value={selectedActivityLevel}
                  onChange={(v) =>
                    form.setValue("activityLevel", v, { shouldValidate: true })
                  }
                  options={activityOptions}
                />
                <p className="mt-2 text-xs text-rose-500">
                  {form.formState.errors.activityLevel?.message}
                </p>
              </div>
            </div>
          )}

          {step === 2 && previewPlan && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatTile
                  icon={<Scale className="h-5 w-5" />}
                  label="BMI"
                  value={String(previewBmi ?? "—")}
                />
                <StatTile
                  icon={<Target className="h-5 w-5" />}
                  label="Daily target"
                  value={`${previewCalories ?? 0} kcal`}
                />
                <StatTile
                  icon={<Droplets className="h-5 w-5" />}
                  label="Water goal"
                  value={`${previewWater ?? 0} ml`}
                />
              </div>

              <section className="rounded-[28px] border border-white/70 bg-white/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      Generated exchange plan
                    </p>
                    <h3 className="mt-1.5 text-lg font-semibold text-slate-900">
                      Daily servings (your dietitian can edit these later)
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                    <Calculator className="h-3.5 w-3.5" />
                    Auto-calculated
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {exchangeOrder.map((category) => {
                    const meta = categoryMeta[category];
                    return (
                      <div
                        key={category}
                        className={`rounded-[22px] border border-white/70 bg-gradient-to-br ${meta.accent} p-4 ring-1 ring-white/70`}
                      >
                        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                          {meta.label}
                        </p>
                        <p className="mt-1.5 text-3xl font-semibold text-slate-900">
                          {previewPlan[category]}
                          <span className="ml-1.5 text-sm font-normal text-slate-500">
                            servings
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/70 bg-white/65 p-5">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ede8f5] text-slate-700">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div className="text-sm leading-6 text-slate-600">
                    <p className="font-semibold text-slate-900">
                      A quick note before you finish
                    </p>
                    <p className="mt-1">
                      This is an educational starting point based on standard
                      exchange-system math. It is not medical advice. Once you
                      finish, your dashboard, the Food Groups page, the AI coach
                      prompt ideas, and your dietitian view will all reflect
                      these same numbers so everything stays in sync.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-between gap-3 border-t border-white/60 bg-gradient-to-t from-white/95 via-white/90 to-transparent px-6 py-4">
            <div className="text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Auto-login active · Plan saves to your account
              </span>
            </div>
            <div className="flex items-center gap-2">
              {step === 2 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </Button>
              )}
              <Button type="submit" size="lg">
                {step === 1 ? (
                  <>
                    Preview my plan
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Finish & go to dashboard
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,rgba(237,232,245,0.95),rgba(229,231,237,0.85))] text-slate-800">
        {icon}
      </div>
      <p className="mt-3 text-[11px] uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
