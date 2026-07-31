import { FOOD_GROUPS_REFERENCE } from "@/features/coach/food-groups-reference";
import { getFoodGroupImageUrl } from "@/features/food-groups/image-config";
import { categoryLabels } from "@/lib/demo-data";
import type { ExchangeCategory } from "@/types/app";

export type FoodGroupCatalogItem = {
  id: string;
  category: ExchangeCategory;
  categoryLabel: string;
  categoryHref: string;
  subcategory: string;
  subcategoryHref: string;
  name: string;
  serving: string;
  exchanges: number;
  imageUrl: string;
  tips?: string;
};

export type FoodGroupCatalogSection = {
  category: ExchangeCategory;
  categoryLabel: string;
  categoryHref: string;
  description: string;
  exchangeSummary: string;
  accentClass: string;
  subcategories: {
    name: string;
    href: string;
    items: FoodGroupCatalogItem[];
  }[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSubcategory(category: ExchangeCategory, name: string) {
  const value = name.toLowerCase();

  switch (category) {
    case "starch":
      if (/(rice|oat|quinoa|corn|pasta)/.test(value)) return "Grains & cereals";
      if (/(bread|pita|muffin|tortilla|cracker)/.test(value)) return "Breads & wraps";
      if (/(potato|popcorn)/.test(value)) return "Starchy vegetables & snacks";
      return "Beans & mixed starches";
    case "fruit":
      if (/(berry|grape|watermelon)/.test(value)) return "Fresh fruit bowls";
      if (/(date|raisin|juice)/.test(value)) return "Dried fruit & juices";
      return "Whole fruits";
    case "vegetable":
      if (/(salad|spinach|cabbage)/.test(value)) return "Leafy greens";
      if (/(broccoli|cauliflower|asparagus|green beans)/.test(value)) return "Green vegetables";
      if (/(carrot|tomato|pepper|cucumber|celery|onion)/.test(value)) return "Salad vegetables";
      return "Cooked vegetables";
    case "protein":
      if (/(chicken|turkey|beef|lamb|ham)/.test(value)) return "Meats & poultry";
      if (/(salmon|tuna|shrimp|fish|crab)/.test(value)) return "Fish & seafood";
      if (/(egg)/.test(value)) return "Eggs";
      if (/(yogurt|cottage cheese)/.test(value)) return "Dairy proteins";
      return "Plant proteins";
    case "dairy":
      if (/(milk|laban|ayran|kefir)/.test(value)) return "Milks & drinks";
      if (/(yogurt|labneh)/.test(value)) return "Yogurts";
      if (/(feta|ricotta|mozzarella|halloumi|cheese)/.test(value)) return "Cheeses";
      return "Dessert dairy";
    case "fat":
      if (/(oil|butter|margarine|mayonnaise|tahini)/.test(value)) return "Oils & spreads";
      if (/(avocado|olive)/.test(value)) return "Avocado & olives";
      if (/(almond|walnut|peanut|pistachio|cashew)/.test(value)) return "Nuts";
      return "Seeds & creamy extras";
    default:
      return "General";
  }
}

export const FOOD_GROUPS_CATALOG: FoodGroupCatalogSection[] = FOOD_GROUPS_REFERENCE.map((group) => {
  const categoryHref = `#${slugify(group.displayName)}`;
  const grouped = new Map<string, FoodGroupCatalogItem[]>();

  group.foods.forEach((food) => {
    const subcategory = getSubcategory(group.category, food.name);
    const subcategoryHref = `${categoryHref}-${slugify(subcategory)}`;
    const item: FoodGroupCatalogItem = {
      id: `${group.category}-${slugify(food.name)}`,
      category: group.category,
      categoryLabel: categoryLabels[group.category],
      categoryHref,
      subcategory,
      subcategoryHref,
      name: food.name,
      serving: food.serving,
      exchanges: food.exchanges,
      imageUrl: getFoodGroupImageUrl(group.category, food.name),
      tips: food.tips,
    };

    grouped.set(subcategory, [...(grouped.get(subcategory) ?? []), item]);
  });

  return {
    category: group.category,
    categoryLabel: group.displayName,
    categoryHref,
    description: group.description,
    exchangeSummary: group.whatOneExchangeProvides,
    accentClass: group.accentClass,
    subcategories: Array.from(grouped.entries()).map(([name, items]) => ({
      name,
      href: `${categoryHref}-${slugify(name)}`,
      items,
    })),
  };
});
