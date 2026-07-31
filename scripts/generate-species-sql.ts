import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { FOOD_GROUPS_REFERENCE, EXCHANGE_GROUP_ORDER } from "../src/features/coach/food-groups-reference";
import { cleanFoodPromptSubject, getFoodGroupImageUrl } from "../src/features/food-groups/image-config";

function sqlEscape(s: string): string {
  return s.replace(/'/g, "''").replace(/\\/g, "\\\\");
}
function sqlQuote(s: string | null | undefined): string {
  if (s === null || s === undefined) return "NULL";
  return `'${sqlEscape(String(s))}'`;
}
function sqlNum(n: number): string {
  return Number.isFinite(n) ? Number(n.toFixed(2)).toString() : "1";
}
function sqlTextArray(arr: string[]): string {
  const items = arr.map((s) => `"${sqlEscape(s).replace(/"/g, '\\"')}"`).join(",");
  return `ARRAY[${items}]::text[]`;
}
function sqlJsonbStrArray(arr: string[]): string {
  const items = arr.map((s) => JSON.stringify(String(s))).join(",");
  return `'[${items}]'::jsonb`;
}

function subcategorySlug(category: string, name: string): string {
  const n = name.toLowerCase();
  switch (category) {
    case "starch":
      if (/\b(bread|pita|bagel|sourdough|rye|multigrain|tortilla|wrap|english muffin|crumpet|matzo|croissant|pancake|waffle|french toast|scone|biscotti)\b/i.test(n)) return "breads-wraps";
      if (/\b(rice|oat|oats|couscous|bulgur|barley|millet|buckwheat|farro|freekeh|quinoa|pasta|noodle|ramen|muffin|grain|cereal)\b/i.test(n)) return "grains-cereals";
      if (/\b(bean|lentil|chickpea|yam|taro|cassava|sweet potato|potato|fries|hash brown|corn|popcorn|rice cake|rice cracker|graham|pretzel|cracker)\b/i.test(n)) return "starchy-vegetables-snacks";
      return "beans-mixed-starches";
    case "fruit":
      if (/\b(dried|raisin|date|prune|currant|sultana|juice|nectar|applesauce|pear sauce|compote|banana chip)\b/i.test(n)) return "dried-fruit-juices";
      if (/\b(bowl|mixed|frozen|cups)\b/i.test(n)) return "fresh-fruit-bowls";
      return "whole-fruits";
    case "vegetable":
      if (/\b(lettuce|kale|spinach|collard|mustard green|turnip green|chard|beet green|dandelion|watercress|endive|radicchio|frisee|escarole|mizuna|tat soi|arugula|rocket|mache|microgreen)\b/i.test(n)) return "leafy-greens";
      if (/\b(broccoli|cauliflower|romanesco|cabbage|brussels|bok choy|choy sum|gai lan|asparagus|okra|zucchini|squash|pumpkin|eggplant|fennel|green bean|wax bean|snap pea|snow pea|rapini)\b/i.test(n)) return "green-vegetables";
      if (/\b(cucumber|tomato|pepper|radish|celery|carrot|onion|mushroom|leek|scallion|garlic|jicama|kohlrabi|chayote|pickle|sauerkraut|kimchi|salad|tomatillo|shallot)\b/i.test(n)) return "salad-vegetables";
      return "cooked-vegetables";
    case "protein":
      if (/\b(salmon|tuna|sardine|anchovy|mackerel|herring|trout|cod|haddock|hake|pollock|halibut|flounder|sole|tilapia|catfish|grouper|snapper|seabass|mahimahi|swordfish|prawn|shrimp|scallop|crab|lobster|clam|mussel|oyster|calamari|octopus|caviar|fish|seafood)\b/i.test(n)) return "fish-seafood";
      if (/\b(egg|yolk|substitute)\b/i.test(n)) return "eggs";
      if (/\b(chicken|turkey|beef|veal|lamb|pork|duck|quail|rabbit|venison|bison|ostrich|bacon|ham|prosciutto|jerky|deli|pastrami|corned beef|liver|chorizo|canadian bacon)\b/i.test(n)) return "meats-poultry";
      if (/\b(lentil|split pea|pinto|cannellini|navy|great northern|lima|fava|mung|adzuki|edamame|tofu|seitan|tvp|pea protein|whey protein|protein bar)\b/i.test(n)) return "plant-proteins";
      return "dairy-proteins";
    case "dairy":
      if (/\b(milk|kefir|buttermilk|evaporated|condensed|powdered|camel|buffalo|sheep|goat|lactose|chocolate|strawberry|vanilla|oat milk|almond milk|soy milk|rice milk|cashew milk|hemp milk|latte|cappuccino|macchiato|chai|cocoa|smoothie|milkshake|hot cocoa)\b/i.test(n)) return "milks-drinks";
      if (/\b(yogurt|yoghurt|greek|skyr|cottage|labneh|laban|ricotta|mascarpone|cream cheese)\b/i.test(n)) return "yogurts";
      if (/\b(cheese|cheddar|gouda|swiss|emmental|gruyere|parmesan|pecorino|romano|asiago|provolone|monterey|colby|havarti|brie|camembert|mozzarella|feta|halloumi|gorgonzola|blue cheese|roquefort|manchego|paneer|queso fresco|string cheese|ricotta salata|spread)\b/i.test(n)) return "cheeses";
      return "dessert-dairy";
    case "fat":
      if (/\b(oil|olive|canola|sunflower|safflower|soybean|corn|peanut|sesame|walnut|almond|avocado oil|grape|flax|pumpkin seed oil|coconut oil|palm|ghee|butter|margarine|spread|mayo|mayonnaise|aioli|vinaigrette|ranch|italian dressing|thousand island|blue cheese dressing|balsamic glaze|tahini|tzatziki|pesto|tapenade|shortening|lard|suet|cooking spray)\b/i.test(n)) return "oils-spreads";
      if (/\b(avocado|olive|kalamata|nicoise|guacamole|hummus|baba|mutabbal)\b/i.test(n)) return "avocado-olives";
      if (/\b(almonds?|walnuts?|peanuts?|pistachio|cashew|macadamia|hazelnut|pecan|brazil nut|pine nut|pili|chestnut|nut butter|peanut butter|almond butter|cashew butter|hazelnut butter|walnut butter|sunflower butter|pumpkin seed butter|soy nut butter|coconut manna|nutella|bacon bits|fried onion)\b/i.test(n)) return "nuts";
      return "seeds-creamy-extras";
    default:
      return "whole-fruits";
  }
}

const MAIN_OUT = join(process.cwd(), "supabase", "migrations", "0005_insert_expanded_food_species.sql");
const STANDALONE_OUT = join(process.cwd(), "supabase", "combined", "_0005_expanded_species_standalone.sql");

type FoodRow = {
  name: string;
  category: string;
  serving: string;
  exchanges: number;
  imageUrl: string;
  tip: string;
  keywords: string[];
  equiv: string[];
  subSlug: string;
  sortOrder: number;
};

const rows: FoodRow[] = [];
const sortCounter: Record<string, number> = {};
for (const c of EXCHANGE_GROUP_ORDER) sortCounter[c] = 0;

for (const group of FOOD_GROUPS_REFERENCE) {
  const equivPool = group.foods.slice(0, 10).map((f) => `${f.name} — ${f.serving}`);
  for (let i = 0; i < group.foods.length; i++) {
    const f = group.foods[i];
    sortCounter[group.category] += 1;
    const subject = cleanFoodPromptSubject(f.name);
    const img = getFoodGroupImageUrl(group.category, f.name);
    const tip = f.tips ?? `${f.name} pairs well with complementary exchange groups for steady energy in a balanced meal.`;
    const keywords = Array.from(
      new Set([
        ...f.name.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter(Boolean).slice(0, 4),
        group.category,
        "exchange",
        "portion",
        "dietitian",
      ])
    );
    const equiv: string[] = [];
    for (let k = 0; k < 3; k++) equiv.push(equivPool[(i + k + 1) % equivPool.length]);
    rows.push({
      name: f.name,
      category: group.category,
      serving: f.serving,
      exchanges: f.exchanges,
      imageUrl: img,
      tip,
      keywords,
      equiv,
      subSlug: subcategorySlug(group.category, f.name),
      sortOrder: sortCounter[group.category],
    });
  }
}

function foodsValues(r: FoodRow): string {
  return `(${sqlQuote(r.name)}, '${r.category}'::exchange_category, ${sqlQuote(r.serving)}, ${sqlNum(r.exchanges)}, ${sqlQuote(r.imageUrl)}, ${sqlJsonbStrArray(r.equiv)}, ${sqlQuote(r.tip)}, ${sqlTextArray(r.keywords)})`;
}

function catalogValuesSqlList(r: FoodRow): string {
  const col0 = sqlQuote(r.name);
  const col1 = sqlQuote(r.category);
  const col2 = sqlQuote(r.serving);
  const col3 = sqlNum(r.exchanges);
  const col4 = sqlQuote(r.imageUrl);
  const col5 = sqlQuote(r.tip);
  const col6 = String(r.sortOrder);
  const col7 = sqlQuote(r.subSlug);
  return `(${col0}::text, ${col1}::text, ${col2}::text, ${col3}::numeric, ${col4}::text, ${col5}::text, ${col6}::int, ${col7}::text)`;
}

const foodsInserts = rows.map(foodsValues).join(",\n");
const catalogInserts = rows.map(catalogValuesSqlList).join(",\n");

const migrationSql = `-- ================================================================
-- 0005_insert_expanded_food_species.sql
-- Expanded species: ${rows.length} canonical foods across 6 exchange groups.
-- Mirrors FOOD_GROUPS_REFERENCE in src/features/coach/food-groups-reference.ts
-- Safe: uses ON CONFLICT DO NOTHING on every insert.
-- ================================================================

begin;

-- 1. Populate public.foods (search + meal entry table)
insert into public.foods (name, category, serving_size, exchanges, image_url, equivalent_foods, learning_tip, keywords)
values
${foodsInserts}
on conflict do nothing;

commit;

begin;

-- 2. Populate public.food_group_items (catalog UI rows, linked to subcategories)
insert into public.food_group_items (subcategory_id, name, exchange_category, serving_size, exchanges, image_url, notes, sort_order)
with
  cats as (select id, slug from public.food_group_categories),
  subs as (
    select s.id as sub_id, s.slug as sub_slug, c.slug as cat_slug
    from public.food_group_subcategories s
    join cats c on c.id = s.category_id
  ),
  raw(name, exchange_category, serving_size, exchanges, image_url, notes, sort_order, sub_slug) as (
    values
    ${catalogInserts}
  )
select subs.sub_id, raw.name, raw.exchange_category, raw.serving_size, raw.exchanges, raw.image_url, raw.notes, raw.sort_order
from raw
join subs
  on subs.sub_slug = raw.sub_slug
 and subs.cat_slug = case raw.exchange_category
   when 'starch'    then 'starches'
   when 'fruit'     then 'fruits'
   when 'vegetable' then 'vegetables'
   when 'protein'   then 'protein'
   when 'dairy'     then 'dairy'
   when 'fat'       then 'fats'
   else 'fruits'
 end
on conflict do nothing;

commit;
`;

writeFileSync(MAIN_OUT, migrationSql, { encoding: "utf8" });

const standaloneSql = `-- Standalone species seed for Neon/Postgres.
-- ${rows.length} foods. Run after 0001_initial_schema + 0002_seed to import.
insert into public.foods (name, category, serving_size, exchanges, image_url, equivalent_foods, learning_tip, keywords)
values
${foodsInserts}
on conflict do nothing;
`;
writeFileSync(STANDALONE_OUT, standaloneSql, { encoding: "utf8" });

console.log(`Generated ${rows.length} expanded species.`);
console.log(`  Main SQL migration: ${MAIN_OUT}`);
console.log(`  Standalone seed:    ${STANDALONE_OUT}`);
