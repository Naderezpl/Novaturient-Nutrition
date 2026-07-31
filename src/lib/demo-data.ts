import type {
  AdherencePoint,
  ClientRecord,
  CoachPrompt,
  DemoUser,
  ExchangeCategory,
  ExchangePlan,
  FoodItem,
  Lesson,
  MealEntry,
  MotivationalMessage,
  SearchResult,
} from "@/types/app";
import { toImagePrompt } from "@/lib/utils";

const categoryConfig: Record<ExchangeCategory, { base: string[]; portions: string[]; tint: string }> = {
  starch: {
    base: ["Brown Rice", "Oatmeal", "Pita Bread", "Sweet Potato", "Quinoa", "Popcorn", "Pasta", "Tortilla"],
    portions: ["1/3 cup cooked", "1 slice", "1 small", "1/2 cup cooked", "3 cups popped"],
    tint: "from-rose-200/80 to-orange-100/80",
  },
  fruit: {
    base: ["Apple", "Banana", "Berries", "Orange", "Pear", "Mango", "Kiwi", "Peaches"],
    portions: ["1 small", "1 medium", "3/4 cup", "1 cup sliced", "1/2 large"],
    tint: "from-amber-100/90 to-pink-100/80",
  },
  vegetable: {
    base: ["Cucumber", "Spinach", "Carrots", "Tomato", "Broccoli", "Peppers", "Zucchini", "Salad Greens"],
    portions: ["1 cup raw", "1/2 cup cooked", "1 bowl", "3/4 cup"],
    tint: "from-emerald-100/90 to-lime-100/80",
  },
  protein: {
    base: ["Chicken Breast", "Salmon", "Eggs", "Turkey", "Greek Yogurt", "Lentils", "Tofu", "Tuna"],
    portions: ["1 oz", "2 oz", "1/2 cup", "3/4 cup", "1 piece"],
    tint: "from-sky-100/90 to-cyan-100/80",
  },
  dairy: {
    base: ["Milk", "Labneh", "Yogurt", "Kefir", "Cottage Cheese", "Cheese Cubes", "Ricotta", "Laban"],
    portions: ["1 cup", "3/4 cup", "1/3 cup", "2 slices"],
    tint: "from-violet-100/90 to-fuchsia-100/70",
  },
  fat: {
    base: ["Olive Oil", "Avocado", "Tahini", "Nuts", "Seeds", "Peanut Butter", "Walnuts", "Hummus"],
    portions: ["1 tsp", "1 tbsp", "1/8 avocado", "6 pieces", "2 tbsp"],
    tint: "from-stone-200/90 to-yellow-100/70",
  },
};

const firstNames = [
  "Ava", "Layla", "Nora", "Mira", "Zayn", "Omar", "Mason", "Lina", "Sara", "Noah",
  "Mila", "Adam", "Talia", "Yara", "Leo", "Ivy", "Dina", "Elias", "Rami", "Jana",
  "Luca", "Maya", "Hana", "Amir", "Sami", "Ella", "Reem", "Nadine", "Rayan", "Celine",
];

const lastNames = [
  "Haddad", "Salem", "Khan", "Ibrahim", "Murphy", "Yousef", "Parker", "Mansour", "Aziz", "Nasser",
];

export const defaultClientPlan: ExchangePlan = {
  starch: 10,
  fruit: 4,
  vegetable: 4,
  protein: 8,
  dairy: 3,
  fat: 5,
};

export const motivationalMessages: MotivationalMessage[] = [
  {
    title: "Today is about progress",
    body: "Balanced meals count more than perfect meals. One thoughtful choice at a time is enough.",
  },
  {
    title: "Flexible eating works",
    body: "You still have room to build something satisfying. Use your exchanges as options, not restrictions.",
  },
  {
    title: "Consistency beats intensity",
    body: "A simple protein, a starch, and one vegetable can carry the whole day beautifully.",
  },
];

export const coachPrompts: CoachPrompt[] = [
  {
    id: "prompt-1",
    title: "What can I eat tonight?",
    prompt: "You still have 3 starch, 2 protein, and 1 dairy exchange left. Give me flexible dinner ideas.",
  },
  {
    id: "prompt-2",
    title: "Estimate my meal",
    prompt: "I had chicken, rice, olive oil and salad. Help me estimate the exchanges.",
  },
  {
    id: "prompt-3",
    title: "Swap a food",
    prompt: "What are a few substitutes for one starch exchange if I do not want bread?",
  },
];

export const lessons: Lesson[] = [
  ["what-are-food-exchanges", "What are food exchanges?", "Foundations"],
  ["building-balanced-meals", "Building balanced meals", "Meals"],
  ["portion-sizes", "Portion sizes", "Practical skills"],
  ["reading-nutrition-labels", "Reading nutrition labels", "Practical skills"],
  ["meal-prep", "Meal prep", "Lifestyle"],
  ["grocery-shopping", "Grocery shopping", "Lifestyle"],
  ["eating-out", "Eating out", "Lifestyle"],
  ["protein", "Protein essentials", "Nutrition"],
  ["healthy-fats", "Healthy fats", "Nutrition"],
  ["water-and-hydration", "Water and hydration", "Nutrition"],
  ["vegetables", "Why vegetables matter", "Nutrition"],
].map(([slug, title, topic], index) => ({
  slug,
  title,
  topic,
  summary: "A calm, practical lesson with quick wins, food examples, and simple decisions you can use today.",
  illustrationUrl: toImagePrompt(
    `premium editorial healthcare illustration, soft pastel nutrition education, ${title}, glassmorphism card art, elegant minimal website visual`,
    "landscape_16_9",
  ),
  tips: [
    "Pair one anchor food with one support food to make meals easier to repeat.",
    "Use the exchange system to flex portions instead of labeling foods as good or bad.",
    "Keep your meals familiar. Better structure is often more useful than full reinvention.",
  ],
  takeaways: [
    "Build confidence through repetition.",
    "Keep meals satisfying before you make them stricter.",
    `Lesson ${index + 1} supports flexible consistency.`,
  ],
}));

export const foods: FoodItem[] = Object.entries(categoryConfig).flatMap(([category, config]) =>
  Array.from({ length: 56 }, (_, index) => {
    const base = config.base[index % config.base.length];
    const portion = config.portions[index % config.portions.length];
    const variant = index + 1;
    const exchanges = category === "vegetable" ? 0.5 : 1;
    const name = `${base} ${variant}`;

    return {
      id: `${category}-${variant}`,
      name,
      category: category as ExchangeCategory,
      servingSize: portion,
      exchanges,
      equivalentFoods: [
        `${config.base[(index + 1) % config.base.length]} ${config.portions[(index + 1) % config.portions.length]}`,
        `${config.base[(index + 2) % config.base.length]} ${config.portions[(index + 2) % config.portions.length]}`,
        `${config.base[(index + 3) % config.base.length]} ${config.portions[(index + 3) % config.portions.length]}`,
      ],
      learningTip: `${base} can fit well in a balanced meal when you pair it with protein or fiber for staying power.`,
      keywords: [base.toLowerCase(), category, "exchange", "meal", "portion"],
      imageUrl: toImagePrompt(
        `luxury food photography, ${base}, premium nutrition app, pastel soft light, clean plate, professional healthcare aesthetic`,
      ),
    };
  }),
);

function buildAdherence(seed: number): AdherencePoint[] {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => ({
    day,
    adherence: 68 + ((seed * 7 + index * 5) % 28),
    waterMl: 1600 + ((seed * 110 + index * 150) % 1400),
    weightKg: Number((74 - seed * 0.35 - index * 0.08).toFixed(1)),
  }));
}

function buildMeals(seed: number): MealEntry[] {
  return [
    {
      id: `meal-${seed}-1`,
      mealType: "breakfast",
      foods: ["Toast", "Eggs", "Apple", "Milk"],
      exchanges: { starch: 2, protein: 1, fruit: 1, dairy: 1 },
      calories: 430,
      loggedAt: "2026-07-31T08:30:00.000Z",
      notes: "Nice balance. Consider one vegetable exchange later.",
    },
    {
      id: `meal-${seed}-2`,
      mealType: "lunch",
      foods: ["Chicken bowl", "Rice", "Salad", "Olive oil"],
      exchanges: { starch: 2, protein: 2, vegetable: 1, fat: 1 },
      calories: 520,
      loggedAt: "2026-07-31T13:00:00.000Z",
    },
    {
      id: `meal-${seed}-3`,
      mealType: "snack",
      foods: ["Greek yogurt", "Berries"],
      exchanges: { dairy: 1, fruit: 1, protein: 1 },
      calories: 180,
      loggedAt: "2026-07-31T16:00:00.000Z",
    },
  ];
}

export const clients: ClientRecord[] = Array.from({ length: 30 }, (_, index) => {
  const fullName = `${firstNames[index]} ${lastNames[index % lastNames.length]}`;
  const user: DemoUser = {
    id: `client-${index + 1}`,
    fullName,
    email: `${firstNames[index].toLowerCase()}.${lastNames[index % lastNames.length].toLowerCase()}@novaturient.app`,
    role: "client",
    age: 23 + (index % 19),
    sex: index % 2 === 0 ? "female" : "male",
    heightCm: 158 + (index % 18),
    weightKg: 58 + index,
    goal: (["fat_loss", "maintenance", "muscle_gain"] as const)[index % 3],
    activityLevel: (["sedentary", "light", "moderate", "active", "very_active"] as const)[index % 5],
    joinDate: `2026-0${(index % 6) + 1}-15`,
  };

  return {
    user,
    plan: {
      starch: 8 + (index % 4),
      fruit: 3 + (index % 2),
      vegetable: 4 + (index % 2),
      protein: 7 + (index % 3),
      dairy: 2 + (index % 2),
      fat: 4 + (index % 3),
    },
    adherence: buildAdherence(index + 1),
    recentMeals: buildMeals(index + 1),
    waterGoalMl: 2200 + ((index % 4) * 300),
  };
});

export const dietitianUser: DemoUser = {
  id: "dietitian-1",
  fullName: "Dr. Leena Rahal",
  email: "leena@novaturient.app",
  role: "dietitian",
};

export const currentClient = clients[4];

export function buildSearchResults(query: string): SearchResult[] {
  const value = query.toLowerCase();

  if (!value) {
    return [];
  }

  const foodMatches = foods
    .filter((item) => item.name.toLowerCase().includes(value))
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      type: "food" as const,
      title: item.name,
      subtitle: `${item.servingSize} • ${item.category}`,
      href: "/dashboard/foods",
    }));

  const lessonMatches = lessons
    .filter((item) => item.title.toLowerCase().includes(value))
    .slice(0, 3)
    .map((item) => ({
      id: item.slug,
      type: "lesson" as const,
      title: item.title,
      subtitle: item.topic,
      href: "/dashboard/learn",
    }));

  const clientMatches = clients
    .filter((item) => item.user.fullName.toLowerCase().includes(value))
    .slice(0, 4)
    .map((item) => ({
      id: item.user.id,
      type: "client" as const,
      title: item.user.fullName,
      subtitle: `${item.user.goal?.replace("_", " ")} • ${item.user.activityLevel}`,
      href: `/admin/clients/${item.user.id}`,
    }));

  const mealMatches = currentClient.recentMeals
    .filter((meal) => meal.foods.join(" ").toLowerCase().includes(value))
    .map((meal) => ({
      id: meal.id,
      type: "meal" as const,
      title: meal.foods.join(", "),
      subtitle: meal.mealType,
      href: "/dashboard/meals",
    }));

  return [...foodMatches, ...lessonMatches, ...clientMatches, ...mealMatches];
}

export function getCategoryTint(category: ExchangeCategory) {
  return categoryConfig[category].tint;
}
