import type { ExchangeCategory, ExchangePlan, MealEntry } from "@/types/app";
import {
  EXCHANGE_GROUP_ORDER,
  FOOD_GROUPS_REFERENCE,
  getExchangeGroup,
  type ReferenceFood,
} from "./food-groups-reference";
import { exchangeOrder, emptyExchangePlan, getRemainingExchanges } from "@/lib/exchanges";
import { categoryLabels, currentClient } from "@/lib/demo-data";

export type SubstitutionResult = {
  category: ExchangeCategory;
  citation: string;
  pdfLinkText: string;
  alternatives: ReferenceFood[];
  teachingLine: string;
  followUpSuggestion: string;
};

export type Intent =
  | { kind: "substitute"; category: ExchangeCategory; exclude: string }
  | { kind: "tonight_ideas"; remaining: ExchangePlan }
  | { kind: "explain_last_meal" }
  | { kind: "estimate_meal"; rawText: string }
  | { kind: "teaching"; category: ExchangeCategory }
  | { kind: "general" };

const CATEGORY_KEYWORDS: Record<ExchangeCategory, string[]> = {
  starch: [
    "starch",
    "carbs",
    "carb",
    "carbohydrate",
    "bread",
    "rice",
    "oats",
    "pasta",
    "potato",
    "quinoa",
    "grain",
  ],
  fruit: ["fruit", "apple", "banana", "berries", "orange", "mango", "kiwi", "grape"],
  vegetable: [
    "veggie",
    "vegetable",
    "vegetables",
    "veggies",
    "salad",
    "broccoli",
    "spinach",
    "carrot",
    "tomato",
  ],
  protein: [
    "protein",
    "chicken",
    "fish",
    "salmon",
    "tuna",
    "shrimp",
    "egg",
    "eggs",
    "meat",
    "beef",
    "tofu",
    "lentils",
    "lentil",
    "yogurt",
    "cottage",
    "shrimp",
    "turkey",
  ],
  dairy: [
    "dairy",
    "milk",
    "cheese",
    "yogurt",
    "kefir",
    "labneh",
    "laban",
    "cottage cheese",
    "ricotta",
    "mozzarella",
    "halloumi",
  ],
  fat: [
    "fat",
    "oil",
    "olive",
    "avocado",
    "butter",
    "nuts",
    "seeds",
    "tahini",
    "hummus",
    "peanut",
    "almond",
    "walnut",
    "pistachio",
  ],
};

const EXCLUDE_HINTS = ["instead of", "other than", "not", "without", "except", "besides", "like"];

export function detectIntent(
  text: string,
  remaining: ExchangePlan,
): Intent {
  const q = text.toLowerCase().trim();

  // "what can I eat tonight" / "tonight ideas"
  if (
    /(tonight|dinner|supper|(what can|what should).*(eat|have|make)|meal ideas)/.test(q)
  ) {
    return { kind: "tonight_ideas", remaining };
  }

  if (/(explain|review|summarize|last meal|my meal|today's meals|meals i had|last meal)/.test(q)) {
    return { kind: "explain_last_meal" };
  }

  if (
    /(i had|i ate|we had|i made|was|= with|contains|consisted of|consist of|consisting of)/.test(q)
  ) {
    return { kind: "estimate_meal", rawText: text };
  }

  // Teaching mode (plural question about a group)
  const teachMatch = exchangeOrder.find((c) =>
    new RegExp(`what (are|is) (a |an |)(${c}|${c}s|${c} exchange|${c} exchanges)`).test(q)
  );
  if (teachMatch) return { kind: "teaching", category: teachMatch };

  // Substitution intent — substitution keywords or implicit "another X" / "more X"
  const isSubstitutionIntent =
    /(substitut|alternative|instead|different|another|one more|more |swap|instead of|other than|option|choices|not.*fish|not.*meat)/.test(
      q,
    );

  let matchedCategory: ExchangeCategory | null = null;
  let score = 0;
  for (const category of exchangeOrder) {
    const hits = CATEGORY_KEYWORDS[category].filter((kw) =>
      new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?\\b`).test(q),
    ).length;
    if (hits > score) {
      score = hits;
      matchedCategory = category;
    }
  }

  // Protein-implied: user literally typed "protein" or "fish" as exclude
  if (matchedCategory && (isSubstitutionIntent || score >= 1)) {
    const exclude = extractExcludePhrase(q);
    return { kind: "substitute", category: matchedCategory, exclude };
  }

  // Backstop: "another [group]" phrasing
  const backupMatch = exchangeOrder.find((c) =>
    new RegExp(`(another|more|different)\\s+(a |an |)(${c}|${c}s)`).test(q)
  );
  if (backupMatch) {
    return {
      kind: "substitute",
      category: backupMatch,
      exclude: extractExcludePhrase(q),
    };
  }

  return { kind: "general" };
}

function extractExcludePhrase(q: string): string {
  // "another protein than fish" → fish
  for (const hint of EXCLUDE_HINTS) {
    const idx = q.indexOf(hint);
    if (idx !== -1) {
      const after = q.slice(idx + hint.length).trim();
      const clipped = after.replace(/[?!.]/g, "").trim().split(/\s+/).slice(0, 2).join(" ");
      if (clipped) return clipped;
    }
  }
  // Heuristic: remove first category keyword and take the last 1–2 words as the exclude target
  const withoutCategory = q
    .replace(/\b(starch|starchy|fruit|vegetable|veggie|protein|dairy|fat)s?\b/g, "")
    .trim();
  const words = withoutCategory.replace(/[?!.]/g, "").split(/\s+/).filter(Boolean);
  if (words.length <= 2) return words.join(" ");
  return words.slice(-2).join(" ");
}

export function getSubstitutions(
  category: ExchangeCategory,
  excludeName = "",
  count = 5,
): SubstitutionResult {
  const group = getExchangeGroup(category);
  const exclude = excludeName.toLowerCase();

  const filtered = group.foods.filter((f) => {
    if (!exclude) return true;
    const n = f.name.toLowerCase();
    return (
      !n.includes(exclude) &&
      !exclude.split(/\s+/).some((w) => w && n.includes(w))
    );
  });

  const alternatives = shuffle(filtered).slice(0, Math.max(count, 3));

  return {
    category,
    citation: group.pdfPageHint,
    pdfLinkText: group.pdfPageHint,
    alternatives,
    teachingLine: `One ${group.displayName.slice(0, -1)} exchange = ${group.whatOneExchangeProvides}.`,
    followUpSuggestion: exclude
      ? `Prefer ${exclude} most days, and use one of these when you want a change.`
      : "Pick the one that feels easiest in your fridge or pantry right now.",
  };
}

export function buildTonightIdeas(
  remaining: ExchangePlan,
): {
  title: string;
  body: string[];
  citation: string;
} {
  const available = exchangeOrder.filter((c) => remaining[c] > 0);
  const starch = Math.floor(remaining.starch);
  const protein = Math.floor(remaining.protein);
  const vegetable = Math.floor(remaining.vegetable);
  const fat = Math.floor(remaining.fat);
  const fruit = Math.floor(remaining.fruit);
  const dairy = Math.floor(remaining.dairy);

  const header = `You still have:\n${exchangeOrder
    .filter((c) => remaining[c] > 0)
    .map((c) => `  •  ${remaining[c]} ${categoryLabels[c]} exchange${remaining[c] === 1 ? "" : "s"}`)
    .join("\n")}\n\nHere are several flexible dinner ideas that fit your remaining exchanges — no rigid plan required.`;

  const ideas: string[] = [];

  ideas.push(
    `Grilled ${getRandomFoodFromGroup("protein", 1)} (${protein} protein exchanges) with ${getRandomFoodFromGroup("vegetable", 1)} (${vegetable} vegetable) and a side of ${getRandomFoodFromGroup("starch", 1)} (${starch} starch). Finish with ${getRandomFoodFromGroup("fat", 1)} drizzled over vegetables for flavor (${fat} fat exchanges).`,
  );

  ideas.push(
    `Big bowl meal: ${getRandomFoodFromGroup("starch", 1)} base (${starch} starch), ${getRandomFoodFromGroup("protein", 1)} (${protein} protein), pile on ${getRandomFoodFromGroup("vegetable", 1)} + ${getRandomFoodFromGroup("vegetable", 2)} (${vegetable} vegetable) and top with ${getRandomFoodFromGroup("fat", 1)} for ${fat} fat. A drizzle of ${getRandomFoodFromGroup("dairy", 1)} on the side uses ${dairy} dairy.`,
  );

  ideas.push(
    `Warm plate with ${getRandomFoodFromGroup("protein", 2)} (${protein} protein), ${getRandomFoodFromGroup("starch", 2)} (${starch} starch), a large serving of ${getRandomFoodFromGroup("vegetable", 3)} (${vegetable} vegetable), and a little ${getRandomFoodFromGroup("fat", 2)} for richness. Add ${getRandomFoodFromGroup("fruit", 1)} + ${getRandomFoodFromGroup("dairy", 2)} for a sweet dessert end — that uses your ${fruit} fruit and ${dairy} dairy.`,
  );

  return {
    title: header,
    body: ideas,
    citation:
      "Exchange portions above reference the Food Groups Reference teaching tables for each group.",
  };
}

export function buildEstimate(rawText: string): {
  summary: string;
  detected: { food: string; category: ExchangeCategory; exchanges: number; servingSuggestion: string }[];
  questions: string[];
  citation: string;
} {
  const tokens = tokenize(rawText);
  const detected: ReturnType<typeof buildEstimate>["detected"] = [];
  const unresolved: string[] = [];

  for (const token of tokens) {
    let matched: { category: ExchangeCategory; food: ReferenceFood } | null = null;
    for (const c of exchangeOrder) {
      const group = getExchangeGroup(c);
      const f =
        group.foods.find((x) =>
          token.includes(x.name.toLowerCase().split(" ")[0] ?? "")
        ) ?? group.foods.find((x) => token.includes(x.name.toLowerCase()));
      if (f) {
        matched = { category: c, food: f };
        break;
      }
    }
    if (matched) {
      detected.push({
        food: matched.food.name,
        category: matched.category,
        exchanges: matched.food.exchanges,
        servingSuggestion: `Approx: 1 exchange = ${matched.food.serving}`,
      });
    } else {
      unresolved.push(token);
    }
  }

  const questions: string[] = [];
  if (unresolved.length > 0) {
    questions.push(
      `Serving sizes weren't clear for: ${unresolved.join(", ")}. About how much did you have — a palm-sized portion, half a plate, or maybe a cup?`,
    );
  }
  if (detected.some((d) => d.category === "fat")) {
    questions.push(
      "For fats (oil, butter, nuts, dressing): was it about 1 teaspoon, 1 tablespoon, or a small handful? Fats add up quickly.",
    );
  }

  const lines = exchangeOrder
    .map((c) => {
      const total = detected
        .filter((d) => d.category === c)
        .reduce((acc, d) => acc + d.exchanges, 0);
      return total > 0 ? `• ${total} ${categoryLabels[c]} exchange${total === 1 ? "" : "s"}` : null;
    })
    .filter(Boolean) as string[];

  return {
    summary:
      lines.length === 0
        ? "Let me know a specific food and portion, and I'll map it to exchange groups."
        : `Rough exchange estimate for:\n  "${rawText}"\n\n${lines.join("\n")}\n\nThis is an estimate — fine-tune serving sizes below if it was more or less.`,
    detected,
    questions,
    citation: "Exchange values referenced from the Food Groups Reference serving tables.",
  };
}

export function buildExplainLastMeal(lastMeal: MealEntry | undefined) {
  if (!lastMeal) {
    return {
      title: "Let's look at your meals.",
      body: [
        "I don't see a logged meal yet. Try the Meal Builder first — I'll explain the exchanges after each one you save, always in an encouraging way.",
      ],
      citation: "Exchange counting follows the Food Groups Reference portion tables.",
    };
  }
  const plan = lastMeal.exchanges;
  const lines = exchangeOrder
    .filter((c) => (plan[c] ?? 0) > 0)
    .map((c) => `• ${plan[c]} ${categoryLabels[c]} exchange${(plan[c] ?? 0) === 1 ? "" : "s"}`);

  const body = [
    `This meal contains:\n${lines.join("\n")}`,
    plan.vegetable && plan.protein && plan.starch
      ? "Nice balance — protein + starch + vegetables means you'll stay full for a while."
      : "Good start. Consider adding a vegetable or a little protein if you find it hard to stay full to the next meal.",
    !plan.vegetable
      ? "Consider adding one vegetable exchange — anything green or colorful works."
      : "Vegetable score: great plate coverage.",
  ];

  return {
    title: "Your last meal, exchange by exchange",
    body,
    citation: "Portion rules cited from the Food Groups Reference table for each exchange group.",
  };
}

export function buildTeaching(category: ExchangeCategory) {
  const g = getExchangeGroup(category);
  return {
    title: `All about ${g.displayName} exchanges`,
    body: [
      `${g.displayName} — ${g.description}`,
      `One ${g.displayName.slice(0, -1)} exchange gives you roughly ${g.whatOneExchangeProvides}.`,
      `Here are five one-exchange choices from the Food Groups Reference table. If you want even more, scroll up and click the "Food groups reference" button.`,
    ],
    alternatives: shuffle(g.foods).slice(0, 5),
    citation: g.pdfPageHint,
  };
}

function getRandomFoodFromGroup(category: ExchangeCategory, seed: number): string {
  const g = getExchangeGroup(category);
  return g.foods[(seed * 3 + 1) % g.foods.length].name;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[,.!?;:()]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .reduce<string[]>((acc, cur, i, all) => {
      acc.push(cur);
      if (i > 0) acc.push(`${all[i - 1]} ${cur}`);
      if (i > 1) acc.push(`${all[i - 2]} ${all[i - 1]} ${cur}`);
      return acc;
    }, []);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export { EXCHANGE_GROUP_ORDER, FOOD_GROUPS_REFERENCE, exchangeOrder };

export function makeStaticRemaining(): ExchangePlan {
  const r = getRemainingExchanges(currentClient.plan, currentClient.recentMeals);
  return exchangeOrder.reduce((acc, c) => {
    acc[c] = Number(r[c]) > 0 ? Math.max(1, Math.round(r[c])) : 0;
    return acc;
  }, emptyExchangePlan());
}
