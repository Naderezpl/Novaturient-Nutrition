import type { ExchangeCategory, ExchangePlan, FoodItem, MealEntry } from "@/types/app";

export const exchangeOrder: ExchangeCategory[] = [
  "starch",
  "fruit",
  "vegetable",
  "protein",
  "dairy",
  "fat",
];

export function emptyExchangePlan(): ExchangePlan {
  return {
    starch: 0,
    fruit: 0,
    vegetable: 0,
    protein: 0,
    dairy: 0,
    fat: 0,
  };
}

export function getConsumedExchanges(meals: MealEntry[]) {
  return meals.reduce((accumulator, meal) => {
    exchangeOrder.forEach((category) => {
      accumulator[category] += meal.exchanges[category] ?? 0;
    });
    return accumulator;
  }, emptyExchangePlan());
}

export function getRemainingExchanges(targets: ExchangePlan, meals: MealEntry[]) {
  const consumed = getConsumedExchanges(meals);

  return exchangeOrder.reduce((accumulator, category) => {
    accumulator[category] = Math.max(targets[category] - consumed[category], 0);
    return accumulator;
  }, emptyExchangePlan());
}

export function buildMealExchangeSummary(foods: FoodItem[]) {
  return foods.reduce((accumulator, food) => {
    accumulator[food.category] += food.exchanges;
    return accumulator;
  }, emptyExchangePlan());
}

export function describeMealBalance(meal: Partial<ExchangePlan>) {
  const lines = exchangeOrder
    .filter((category) => (meal[category] ?? 0) > 0)
    .map((category) => `${meal[category]} ${category}`);

  if (!lines.length) {
    return "No exchanges detected yet.";
  }

  return lines.join(" • ");
}

export function getFriendlyWarning(
  targets: ExchangePlan,
  consumed: ExchangePlan,
  mealSummary: Partial<ExchangePlan>,
) {
  const exceeded = exchangeOrder.filter((category) => {
    return consumed[category] + (mealSummary[category] ?? 0) > targets[category];
  });

  if (!exceeded.length) {
    return null;
  }

  return `This meal goes above today's ${exceeded.join(", ")} target. You can still log it and rebalance the rest of the day with lighter choices.`;
}
