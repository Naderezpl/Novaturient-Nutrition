import type {
  ActivityLevel,
  ClientGoal,
  ExchangePlan,
} from "@/types/app";
import { emptyExchangePlan } from "@/lib/exchanges";

export type OnboardingInputs = {
  sex: "female" | "male";
  ageYears: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: ClientGoal;
  bodyFatPct?: number;
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_CALORIE_ADJUSTMENT: Record<ClientGoal, number> = {
  fat_loss: -400,
  maintenance: 0,
  muscle_gain: 300,
};

export function roundPlan(plan: ExchangePlan): ExchangePlan {
  const result = emptyExchangePlan();
  (Object.keys(result) as (keyof ExchangePlan)[]).forEach((cat) => {
    result[cat] = Math.max(1, Math.round(plan[cat]));
  });
  return result;
}

export function calculateBmr(inputs: OnboardingInputs): number {
  const { sex, ageYears, heightCm, weightKg, bodyFatPct } = inputs;

  if (bodyFatPct && bodyFatPct > 0 && bodyFatPct < 100) {
    const ffmKg = weightKg * (1 - bodyFatPct / 100);
    return 370 + 21.6 * ffmKg;
  }

  if (sex === "male") {
    return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * ageYears - 161;
}

export function calculateTee(inputs: OnboardingInputs): number {
  const bmr = calculateBmr(inputs);
  return bmr * ACTIVITY_MULTIPLIERS[inputs.activityLevel];
}

export function calculateTargetCalories(inputs: OnboardingInputs): number {
  const tee = calculateTee(inputs);
  return Math.max(1200, Math.round(tee + GOAL_CALORIE_ADJUSTMENT[inputs.goal]));
}

export function calculateWaterGoalMl(inputs: OnboardingInputs): number {
  const base = inputs.weightKg * 35;
  const activityBonus =
    {
      sedentary: 0,
      light: 150,
      moderate: 300,
      active: 500,
      very_active: 700,
    }[inputs.activityLevel] ?? 0;
  const goalBonus = inputs.goal === "muscle_gain" ? 200 : 0;
  return Math.round(base + activityBonus + goalBonus);
}

export function calculateExchangePlan(inputs: OnboardingInputs): ExchangePlan {
  const kcal = calculateTargetCalories(inputs);

  const proteinGPerKg =
    {
      fat_loss: 2.0,
      maintenance: 1.6,
      muscle_gain: 2.2,
    }[inputs.goal] ?? 1.6;

  const proteinG = Math.max(
    60,
    Math.round(inputs.weightKg * proteinGPerKg),
  );
  const proteinKcal = proteinG * 4;

  const fatG = Math.max(
    40,
    Math.round((kcal * 0.27) / 9),
  );
  const fatKcal = fatG * 9;

  const remainingKcal = Math.max(0, kcal - proteinKcal - fatKcal);

  let starchKcal = remainingKcal * 0.62;
  let fruitKcal = remainingKcal * 0.14;
  let vegetableKcal = remainingKcal * 0.08;
  let dairyKcal = remainingKcal * 0.1;
  const carbKcalCheck = starchKcal + fruitKcal + vegetableKcal + dairyKcal;
  if (carbKcalCheck > 0) {
    const scale = remainingKcal / carbKcalCheck;
    starchKcal *= scale;
    fruitKcal *= scale;
    vegetableKcal *= scale;
    dairyKcal *= scale;
  }

  const kcalPerExchange = {
    starch: 80,
    fruit: 60,
    vegetable: 25,
    protein: 55,
    dairy: 100,
    fat: 45,
  };

  const raw: ExchangePlan = {
    starch: starchKcal / kcalPerExchange.starch,
    fruit: fruitKcal / kcalPerExchange.fruit,
    vegetable: Math.max(vegetableKcal / kcalPerExchange.vegetable, 3),
    protein: proteinKcal / kcalPerExchange.protein,
    dairy: dairyKcal / kcalPerExchange.dairy,
    fat: fatKcal / kcalPerExchange.fat,
  };

  return roundPlan(raw);
}

export function calculateBmi(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  if (h <= 0) return 0;
  return Number((weightKg / (h * h)).toFixed(1));
}

export const activityLevelLabels: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little exercise, desk job)",
  light: "Light (1–3 days/week walks or movement)",
  moderate: "Moderate (3–5 days/week exercise)",
  active: "Active (6–7 days/week training)",
  very_active: "Very active (daily training + physical job)",
};

export const goalLabels: Record<ClientGoal, string> = {
  fat_loss: "Fat loss",
  maintenance: "Maintenance",
  muscle_gain: "Muscle gain",
};
