import { toImagePrompt } from "@/lib/utils";
import type { ExchangeCategory } from "@/types/app";

const CATEGORY_IMAGE_DEFAULTS: Record<ExchangeCategory, string> = {
  starch: toImagePrompt(
    "premium food photography, wholesome starch foods, rice bread oats on elegant plates, soft pastel healthcare website aesthetic, studio light",
  ),
  fruit: toImagePrompt(
    "premium food photography, fresh fruit assortment, elegant bowl styling, soft pastel healthcare website aesthetic, studio light",
  ),
  vegetable: toImagePrompt(
    "premium food photography, colorful vegetables and salad greens, elegant plate styling, soft pastel healthcare website aesthetic, studio light",
  ),
  protein: toImagePrompt(
    "premium food photography, protein foods including eggs chicken fish tofu, elegant plate styling, soft pastel healthcare website aesthetic, studio light",
  ),
  dairy: toImagePrompt(
    "premium food photography, dairy foods milk yogurt cheese, elegant servingware, soft pastel healthcare website aesthetic, studio light",
  ),
  fat: toImagePrompt(
    "premium food photography, healthy fats avocado nuts olive oil tahini, elegant servingware, soft pastel healthcare website aesthetic, studio light",
  ),
};

// Change any image here and the Food Groups page updates everywhere automatically.
// Use exact food names as keys.
export const FOOD_GROUP_IMAGE_OVERRIDES: Record<string, string> = {
  "Brown rice": toImagePrompt(
    "premium food photography, brown rice in elegant ceramic bowl, soft pastel healthcare website aesthetic, studio light",
  ),
  Oatmeal: toImagePrompt(
    "premium food photography, creamy oatmeal bowl, elegant styling, soft pastel healthcare website aesthetic, studio light",
  ),
  "Chicken breast": toImagePrompt(
    "premium food photography, sliced grilled chicken breast, elegant plate styling, soft pastel healthcare website aesthetic, studio light",
  ),
  Salmon: toImagePrompt(
    "premium food photography, salmon fillet plated elegantly, soft pastel healthcare website aesthetic, studio light",
  ),
  Eggs: toImagePrompt(
    "premium food photography, soft boiled eggs on elegant plate, soft pastel healthcare website aesthetic, studio light",
  ),
  Milk: toImagePrompt(
    "premium food photography, glass bottle of milk and glass pour, elegant styling, soft pastel healthcare website aesthetic, studio light",
  ),
  Avocado: toImagePrompt(
    "premium food photography, sliced avocado on elegant plate, soft pastel healthcare website aesthetic, studio light",
  ),
};

export function getFoodGroupImageUrl(category: ExchangeCategory, name: string) {
  return (
    FOOD_GROUP_IMAGE_OVERRIDES[name] ??
    CATEGORY_IMAGE_DEFAULTS[category]
  );
}
