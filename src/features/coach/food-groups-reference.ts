// Canonical index of the Novaturient Food Groups Reference PDF.
// 6 exchange groups, 15+ example foods per group with serving sizes + exchange counts.
// The AI Coach cites these tables every time it answers a substitution or teaching question,
// so answers always trace back to your teaching document.

import type { ExchangeCategory } from "@/types/app";

export type ReferenceFood = {
  name: string;
  serving: string;
  exchanges: number;
  tips?: string;
};

export type ExchangeGroup = {
  category: ExchangeCategory;
  displayName: string;
  pdfPageHint: string;
  accentClass: string;
  description: string;
  whatOneExchangeProvides: string;
  foods: ReferenceFood[];
};

export const EXCHANGE_GROUP_ORDER: ExchangeCategory[] = [
  "starch",
  "fruit",
  "vegetable",
  "protein",
  "dairy",
  "fat",
];

export const FOOD_GROUPS_REFERENCE: ExchangeGroup[] = [
  {
    category: "starch",
    displayName: "Starches",
    pdfPageHint: "Food Groups Reference · Starches",
    accentClass: "from-[rgba(237,232,245,0.95)]/95 to-[rgba(229,231,237,0.85)]/90",
    description:
      "Choose mostly whole grains and fiber-rich starches. They provide steady energy and help you stay full.",
    whatOneExchangeProvides: "~15 g carbohydrate, ~3 g protein, 0–1 g fat, ~80 kcal",
    foods: [
      { name: "Brown rice", serving: "1/3 cup cooked", exchanges: 1, tips: "Microwave portion cups make meal prep easy." },
      { name: "White rice", serving: "1/3 cup cooked", exchanges: 1 },
      { name: "Oatmeal", serving: "1/2 cup cooked", exchanges: 1, tips: "Oats add soluble fiber for heart health." },
      { name: "Rolled oats (dry)", serving: "3 tbsp", exchanges: 1 },
      { name: "Pita bread", serving: "1/2 pita (1 oz)", exchanges: 1 },
      { name: "Whole-wheat bread", serving: "1 slice (1 oz)", exchanges: 1 },
      { name: "White bread", serving: "1 slice (1 oz)", exchanges: 1 },
      { name: "Tortilla (medium)", serving: "1 tortilla (8 inch)", exchanges: 2 },
      { name: "Pasta", serving: "1/3 cup cooked", exchanges: 1 },
      { name: "Quinoa", serving: "1/3 cup cooked", exchanges: 1, tips: "A complete plant protein for vegetarian days." },
      { name: "Sweet potato", serving: "1 small (3 oz)", exchanges: 1, tips: "Adds vitamins A and C." },
      { name: "Regular potato", serving: "1 small (3 oz) baked", exchanges: 1 },
      { name: "Popcorn", serving: "3 cups popped", exchanges: 1, tips: "Air-popped — a big low-fat snack volume." },
      { name: "Crackers", serving: "6 saltine-style", exchanges: 1 },
      { name: "English muffin", serving: "1/2 muffin", exchanges: 1 },
      { name: "Corn", serving: "1/2 cup kernels", exchanges: 1 },
      { name: "Lentils / beans (starchy)", serving: "1/2 cup cooked", exchanges: 1.5, tips: "Also counts as 1 protein exchange." },
    ],
  },
  {
    category: "fruit",
    displayName: "Fruits",
    pdfPageHint: "Food Groups Reference · Fruits",
    accentClass: "from-[rgba(255,245,235,0.95)]/95 to-[rgba(237,232,245,0.75)]/90",
    description:
      "Whole fruits first, juice occasionally. Whole fruits give fiber and better satiety.",
    whatOneExchangeProvides: "~15 g carbohydrate, 0 g fat, ~60 kcal",
    foods: [
      { name: "Apple", serving: "1 small (4 oz)", exchanges: 1, tips: "Crisp varieties stay satisfying longer." },
      { name: "Banana", serving: "1 small (4 oz)", exchanges: 1 },
      { name: "Orange", serving: "1 medium", exchanges: 1, tips: "Whole orange beats juice — more fiber." },
      { name: "Grapefruit", serving: "1/2 medium", exchanges: 1 },
      { name: "Pear", serving: "1 small", exchanges: 1 },
      { name: "Mango", serving: "1/2 medium fruit", exchanges: 1 },
      { name: "Kiwi", serving: "2 small", exchanges: 1 },
      { name: "Peaches", serving: "2 medium", exchanges: 1 },
      { name: "Berries (mixed)", serving: "3/4 cup", exchanges: 1 },
      { name: "Strawberries", serving: "1 1/4 cup whole", exchanges: 1, tips: "Large volume for low kcal — great snack." },
      { name: "Blueberries", serving: "3/4 cup", exchanges: 1 },
      { name: "Grapes", serving: "17 small", exchanges: 1 },
      { name: "Watermelon", serving: "1 1/4 cup diced", exchanges: 1 },
      { name: "Dates (dried)", serving: "3 small (1 tbsp)", exchanges: 1 },
      { name: "Raisins", serving: "2 tbsp", exchanges: 1 },
      { name: "Apple juice", serving: "1/2 cup", exchanges: 1, tips: "1 small glass — easy to overdrink." },
      { name: "Orange juice", serving: "1/2 cup", exchanges: 1 },
    ],
  },
  {
    category: "vegetable",
    displayName: "Vegetables",
    pdfPageHint: "Food Groups Reference · Vegetables",
    accentClass: "from-[rgba(232,245,232,0.95)]/95 to-[rgba(229,231,237,0.75)]/90",
    description:
      "Fill half your plate with non-starchy vegetables. Think volume + color — few exchanges, lots of nutrition.",
    whatOneExchangeProvides: "~5 g carbohydrate, 2 g protein, 0 g fat, ~25 kcal (0.5 exchange per serving)",
    foods: [
      { name: "Cucumber", serving: "1 cup sliced raw", exchanges: 0.5 },
      { name: "Mixed salad greens", serving: "2 cups raw", exchanges: 0.5, tips: "Big volume — fills up the plate." },
      { name: "Spinach", serving: "2 cups raw / 1/2 cup cooked", exchanges: 0.5, tips: "Cooking shrinks volume but preserves iron." },
      { name: "Carrots", serving: "1 cup raw sticks / 1/2 cup cooked", exchanges: 0.5 },
      { name: "Tomato", serving: "1 medium whole / 1 cup sliced", exchanges: 0.5 },
      { name: "Broccoli", serving: "1 cup florets", exchanges: 0.5, tips: "Steamed 2 minutes — keeps texture & nutrition." },
      { name: "Bell peppers", serving: "1 cup sliced", exchanges: 0.5, tips: "Red peppers = more vitamin C than oranges by weight." },
      { name: "Zucchini", serving: "1 cup sliced", exchanges: 0.5 },
      { name: "Cauliflower", serving: "1 cup florets", exchanges: 0.5 },
      { name: "Cabbage", serving: "1 cup shredded", exchanges: 0.5 },
      { name: "Celery", serving: "3 stalks", exchanges: 0.5 },
      { name: "Green beans", serving: "1/2 cup cooked", exchanges: 0.5 },
      { name: "Asparagus", serving: "6 spears", exchanges: 0.5 },
      { name: "Onion", serving: "1 cup sliced raw", exchanges: 0.5 },
      { name: "Mushrooms", serving: "1 cup sliced", exchanges: 0.5 },
      { name: "Eggplant", serving: "1 cup cubed cooked", exchanges: 0.5 },
      { name: "Artichoke", serving: "1 medium steamed", exchanges: 1 },
    ],
  },
  {
    category: "protein",
    displayName: "Protein",
    pdfPageHint: "Food Groups Reference · Protein",
    accentClass: "from-[rgba(255,232,232,0.95)]/95 to-[rgba(237,232,245,0.85)]/90",
    description:
      "Protein is the anchor of every meal. Rotate sources so you get variety and never feel stuck on one food.",
    whatOneExchangeProvides: "~7 g protein, ~1 g fat (lean), ~55–75 kcal depending on fat grade",
    foods: [
      { name: "Chicken breast", serving: "1 oz cooked", exchanges: 1, tips: "Batch-poach or grill — most versatile protein." },
      { name: "Chicken thigh (lean)", serving: "1 oz cooked", exchanges: 1 },
      { name: "Turkey breast", serving: "1 oz cooked / 1 slice deli", exchanges: 1 },
      { name: "Lean beef", serving: "1 oz cooked", exchanges: 1, tips: "Round or sirloin cuts are lowest fat." },
      { name: "Lamb (lean)", serving: "1 oz cooked", exchanges: 1 },
      { name: "Salmon", serving: "1 oz cooked", exchanges: 1, tips: "Adds omega-3 — 2–3 x per week is ideal." },
      { name: "Tuna (canned in water)", serving: "1 oz drained", exchanges: 1 },
      { name: "Shrimp", serving: "5 large", exchanges: 1, tips: "Fast to cook — stir-fry or steam 2 min." },
      { name: "Eggs", serving: "1 large egg", exchanges: 1, tips: "Whole eggs are fine for most people." },
      { name: "Egg whites", serving: "2 egg whites", exchanges: 1 },
      { name: "Greek yogurt (nonfat)", serving: "1/3 cup", exchanges: 1, tips: "Counts as dairy too — swap either place!" },
      { name: "Cottage cheese (low-fat)", serving: "1/4 cup", exchanges: 1 },
      { name: "Lentils (cooked)", serving: "1/2 cup", exchanges: 2, tips: "Plant-based — keep portions generous." },
      { name: "Chickpeas / hummus base", serving: "1/2 cup cooked", exchanges: 1.5 },
      { name: "Tofu (firm)", serving: "3 oz / 1/2 cup cubed", exchanges: 1, tips: "Press first, then pan-crisp for texture." },
      { name: "Tempeh", serving: "1 oz", exchanges: 1 },
      { name: "Lean ham / deli", serving: "1 oz sliced", exchanges: 1 },
      { name: "White fish (cod, haddock)", serving: "1 oz cooked", exchanges: 1 },
      { name: "Crab / surimi", serving: "1 oz", exchanges: 1 },
    ],
  },
  {
    category: "dairy",
    displayName: "Dairy",
    pdfPageHint: "Food Groups Reference · Dairy",
    accentClass: "from-[rgba(255,255,255,0.98)]/98 to-[rgba(229,231,237,0.75)]/90",
    description:
      "Choose low-fat or skim most days. Greek yogurt and kefir help with satiety and gut variety.",
    whatOneExchangeProvides: "~12 g carb, 8 g protein, 0–8 g fat, ~100–120 kcal",
    foods: [
      { name: "Milk (skim / low-fat)", serving: "1 cup", exchanges: 1 },
      { name: "Laban / Ayran (low-salt)", serving: "1 cup", exchanges: 1 },
      { name: "Kefir", serving: "1 cup", exchanges: 1, tips: "Fermented option — great for digestive comfort." },
      { name: "Yogurt (plain low-fat)", serving: "3/4 cup", exchanges: 1 },
      { name: "Greek yogurt (plain nonfat)", serving: "2/3 cup", exchanges: 1, tips: "Higher protein than regular yogurt." },
      { name: "Labneh (strained yogurt)", serving: "1/3 cup", exchanges: 1 },
      { name: "Cottage cheese (low-fat)", serving: "1 cup", exchanges: 2, tips: "Also counts as protein — great on salads." },
      { name: "Cheese cubes (low-fat)", serving: "1 oz (3 small cubes)", exchanges: 1 },
      { name: "Feta (light)", serving: "1 oz", exchanges: 1 },
      { name: "Ricotta (part-skim)", serving: "1/3 cup", exchanges: 1 },
      { name: "Mozzarella (low-moisture)", serving: "1 oz", exchanges: 1 },
      { name: "Halloumi", serving: "1 oz", exchanges: 1, tips: "Salty — rinse before pan-grilling." },
      { name: "Ice milk / light ice cream", serving: "1/2 cup", exchanges: 1.5 },
      { name: "Pudding (sugar-free, low-fat)", serving: "1/2 cup", exchanges: 1 },
      { name: "Cheese spread (light)", serving: "3 tbsp", exchanges: 1 },
    ],
  },
  {
    category: "fat",
    displayName: "Fats",
    pdfPageHint: "Food Groups Reference · Fats",
    accentClass: "from-[rgba(255,247,232,0.95)]/95 to-[rgba(237,232,245,0.85)]/90",
    description:
      "Keep fat portions small but don't omit them. Fats add flavor and keep hunger away.",
    whatOneExchangeProvides: "~5 g fat, ~45 kcal per 1 fat exchange",
    foods: [
      { name: "Olive oil", serving: "1 tsp", exchanges: 1, tips: "Drizzle on vegetables, don't deep-fry." },
      { name: "Canola oil", serving: "1 tsp", exchanges: 1 },
      { name: "Butter / margarine", serving: "1 tsp", exchanges: 1 },
      { name: "Mayonnaise (light)", serving: "1 tbsp", exchanges: 1 },
      { name: "Avocado", serving: "1/8 whole fruit (2 tbsp)", exchanges: 1, tips: "Creamy swap for mayo in sandwiches." },
      { name: "Tahini", serving: "1 tsp", exchanges: 1 },
      { name: "Peanut butter (no added oil)", serving: "2 tsp", exchanges: 1, tips: "Spread thin on apple slices — filling snack." },
      { name: "Almond butter", serving: "2 tsp", exchanges: 1 },
      { name: "Hummus", serving: "2 tbsp", exchanges: 1, tips: "Works as a fat and a little protein." },
      { name: "Almonds", serving: "6 whole nuts", exchanges: 1 },
      { name: "Walnuts", serving: "4 halves", exchanges: 1, tips: "Omega-3 plant source." },
      { name: "Peanuts (roasted)", serving: "10 nuts", exchanges: 1 },
      { name: "Pistachios", serving: "16 nuts", exchanges: 1, tips: "In-shell eating = slower, more mindful." },
      { name: "Cashews", serving: "6 nuts", exchanges: 1 },
      { name: "Pumpkin / squash seeds", serving: "1 tbsp", exchanges: 1 },
      { name: "Sunflower seeds", serving: "1 tbsp", exchanges: 1 },
      { name: "Sesame seeds", serving: "1 tbsp", exchanges: 1 },
      { name: "Olives (black / green)", serving: "8 large", exchanges: 1 },
      { name: "Coconut (shredded, unsweetened)", serving: "2 tbsp", exchanges: 1 },
      { name: "Sour cream (light)", serving: "2 tbsp", exchanges: 1 },
    ],
  },
];

export function getExchangeGroup(category: ExchangeCategory): ExchangeGroup {
  const g = FOOD_GROUPS_REFERENCE.find((x) => x.category === category);
  if (!g) throw new Error(`Unknown exchange category: ${category}`);
  return g;
}

export function findReferenceFood(
  category: ExchangeCategory,
  name: string,
): ReferenceFood | undefined {
  const g = getExchangeGroup(category);
  const q = name.toLowerCase();
  return (
    g.foods.find((f) => f.name.toLowerCase().includes(q)) ??
    g.foods.find((f) => q.includes(f.name.toLowerCase()))
  );
}
