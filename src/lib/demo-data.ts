import {
  persistedRecordToClientRecord,
  useClientRecordsStore,
} from "@/lib/client-records-store";
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

export const categoryLabels: Record<ExchangeCategory, string> = {
  starch: "Starch",
  fruit: "Fruit",
  vegetable: "Vegetable",
  protein: "Protein",
  dairy: "Dairy",
  fat: "Fat",
};

const DEMO_AESTHETIC =
  "soft pastel healthcare website aesthetic, studio light, bright white background, minimal elegant plating, premium food photography, no borders, no letterbox, no pillarbox, no black bars, fills entire frame, edge-to-edge content";

function platingForDemo(category: ExchangeCategory): string {
  switch (category) {
    case "starch":
      return "on elegant small ceramic plate or portion bowl";
    case "fruit":
      return "on elegant small plate or in small bowl";
    case "vegetable":
      return "on elegant small plate, fresh or lightly steamed";
    case "protein":
      return "on elegant small white plate, properly portioned";
    case "dairy":
      return "in glass, elegant cup, or small portion dish";
    case "fat":
      return "on elegant small dish, in spoon, or in glass ramekin";
    default:
      return "on elegant small plate";
  }
}

const categoryConfig: Record<ExchangeCategory, { base: string[]; portions: string[]; tint: string }> = {
  starch: {
    base: [
      "Brown rice", "White rice", "Wild rice", "Oatmeal", "Rolled oats", "Couscous", "Bulgur", "Barley",
      "Millet", "Quinoa", "Farro", "Freekeh", "Pita bread", "Whole wheat bread", "Sourdough bread",
      "Rye bread", "Multigrain bread", "Tortilla", "Corn tortilla", "Pasta", "Whole wheat pasta",
      "Brown rice pasta", "Chickpea pasta", "Sweet potato", "Regular potato", "Yam", "Taro", "Cassava",
      "Green peas", "Corn", "Popcorn", "Rice cakes", "Crackers", "Graham crackers", "Pretzels",
      "English muffin", "Crumpet", "Matzo", "Bagel", "Croissant", "Pancake", "Waffle", "French toast",
      "Scone", "Biscotti", "Lentils", "Black beans", "Kidney beans", "Chickpeas", "French fries",
      "Hash browns", "Mixed grain bowl", "Ramen noodles", "Basmati rice", "Jasmine rice", "Rice crackers",
    ],
    portions: ["1/3 cup cooked", "1 slice", "1 small", "1/2 cup cooked", "3 cups popped", "1/2 pita", "1 cup kernels"],
    tint: "from-rose-200/80 to-orange-100/80",
  },
  fruit: {
    base: [
      "Apple", "Granny Smith apple", "Red apple", "Banana", "Orange", "Mandarin clementine", "Tangerine",
      "Grapefruit", "Pear", "Bosc pear", "Mango", "Pineapple", "Papaya", "Guava", "Passion fruit",
      "Kiwi", "Lychee", "Peaches", "White peach", "Nectarine", "Plum", "Apricot", "Sweet cherries",
      "Fresh fig", "Blackberry", "Raspberry", "Mixed berries", "Strawberries", "Blueberries",
      "Cranberries", "Grapes", "Green grapes", "Red grapes", "Watermelon", "Cantaloupe melon",
      "Honeydew melon", "Pomegranate", "Dragon fruit pitaya", "Star fruit carambola", "Persimmon",
      "Mulberry", "Coconut meat", "Dried dates", "Medjool dates", "Raisins", "Golden raisins",
      "Dried currants", "Sultanas", "Dried prunes", "Dried apricots", "Dried mango", "Banana chips",
      "Apple juice", "Orange juice", "Grape juice", "Pineapple juice", "Prune juice", "Mango nectar",
      "Frozen mixed berries", "Frozen mango chunks", "Unsweetened applesauce", "Pear sauce",
      "Fruit compote", "Fruit smoothie base", "Lemon", "Lime",
    ],
    portions: ["1 small", "1 medium", "3/4 cup", "1 cup sliced", "1/2 large", "2 tbsp", "1/2 cup"],
    tint: "from-amber-100/90 to-pink-100/80",
  },
  vegetable: {
    base: [
      "Cucumber", "Persian cucumber", "Mixed salad greens", "Iceberg lettuce", "Romaine lettuce",
      "Butter lettuce bibb", "Green leaf lettuce", "Arugula rocket", "Kale", "Baby spinach", "Spinach",
      "Collard greens", "Mustard greens", "Turnip greens", "Swiss chard", "Beet greens", "Dandelion greens",
      "Watercress", "Endive", "Radicchio", "Frisee curly endive", "Escarole", "Mizuna", "Tat soi",
      "Carrots", "Baby carrots", "Parsnips", "Beetroot", "Turnip", "Radish", "Daikon radish",
      "Tomato", "Cherry tomatoes", "Roma tomato", "Heirloom tomato", "Tomatillo",
      "Bell peppers", "Green pepper", "Red pepper", "Yellow pepper", "Orange pepper",
      "Jalapeno chili", "Poblano chili", "Broccoli", "Broccoli rabe rapini", "Cauliflower",
      "Purple cauliflower", "Romanesco", "Cabbage", "Red cabbage", "Savoy cabbage", "Napa cabbage",
      "Bok choy", "Baby bok choy", "Choy sum", "Gai lan Chinese broccoli", "Brussels sprouts",
      "Celery", "Fennel bulb", "Green beans", "French beans haricot vert", "Wax beans",
      "Sugar snap peas", "Snow peas", "Asparagus", "Zucchini", "Yellow squash", "Crookneck squash",
      "Acorn squash", "Butternut squash", "Spaghetti squash", "Kabocha squash", "Pumpkin",
      "Okra", "Eggplant", "Baby eggplant", "Onion", "Red onion", "Yellow onion", "Sweet onion",
      "Shallots", "Leek", "Scallions green onion", "Garlic", "Mushrooms", "Cremini mushrooms",
      "Shiitake mushrooms", "Oyster mushrooms", "Portobello mushroom", "Enoki mushrooms",
      "Artichoke", "Artichoke hearts", "Hearts of palm", "Celery root celeriac", "Jicama",
      "Rutabaga", "Kohlrabi", "Chayote", "Bamboo shoots", "Water chestnuts", "Corn salad mache",
      "Microgreens assortment", "Pickled cucumber", "Sauerkraut", "Kimchi",
    ],
    portions: ["1 cup raw", "1/2 cup cooked", "1 bowl", "3/4 cup", "6 spears", "8 pods"],
    tint: "from-emerald-100/90 to-lime-100/80",
  },
  protein: {
    base: [
      "Chicken breast", "Skinless chicken breast", "Chicken thigh lean", "Skinless chicken thigh",
      "Chicken drumstick", "Chicken wing", "Chicken liver",
      "Turkey breast", "Turkey thigh lean", "Ground turkey", "Turkey bacon light", "Turkey deli slices",
      "Chicken deli slices", "Lean beef", "Beef sirloin", "Beef tenderloin", "Beef eye of round",
      "Beef top round", "Beef bottom round", "Beef flank steak", "Lean ground beef",
      "Extra lean ground beef", "Veal lean cutlet", "Veal liver",
      "Lamb lean", "Lamb leg lean", "Lamb loin chop lean",
      "Pork tenderloin", "Pork loin lean", "Pork chop center cut lean", "Pork ham lean",
      "Canadian bacon", "Pork bacon light", "Duck breast skinless", "Quail", "Rabbit lean",
      "Venison game meat", "Bison lean", "Ostrich lean",
      "Salmon", "Atlantic salmon", "Sockeye salmon", "Smoked salmon lox",
      "Tuna canned in water", "Fresh tuna steak", "Sardines canned", "Anchovies",
      "Mackerel", "Herring", "Trout", "Rainbow trout",
      "White fish cod haddock", "Cod fillet", "Haddock", "Hake", "Pollock", "Halibut",
      "Flounder sole", "Tilapia", "Catfish", "Grouper", "Snapper", "Sea bass", "Mahi mahi",
      "Swordfish", "Shrimp", "Prawns large", "Scallops", "Crab surimi", "King crab legs",
      "Snow crab legs", "Lobster tail", "Clams", "Mussels", "Oysters",
      "Calamari squid", "Grilled octopus", "Caviar small portion",
      "Eggs", "Egg whites", "Egg yolks", "Egg substitute", "Quail eggs",
      "Greek yogurt nonfat", "Greek yogurt low fat", "Icelandic skyr",
      "Cottage cheese low fat", "Ricotta part skim",
      "Lentils cooked", "Red lentils cooked", "Split peas cooked",
      "Black beans protein", "Kidney beans protein", "Pinto beans", "Cannellini beans",
      "Navy beans", "Great northern beans", "Lima beans", "Fava beans", "Mung beans",
      "Adzuki beans", "Chickpeas hummus base", "Edamame green soybeans",
      "Firm tofu", "Extra firm tofu", "Silken soft tofu", "Tempeh", "Seitan wheat meat",
      "Textured vegetable protein TVP", "Pea protein shake", "Whey protein shake",
      "Lean ham deli", "Roast beef deli slices", "Pastrami lean", "Corned beef lean",
      "Prosciutto", "Chorizo low fat", "Beef jerky low sugar", "Low sugar protein bar",
    ],
    portions: ["1 oz", "2 oz", "1/2 cup", "3/4 cup", "1 piece", "5 large shrimp", "1 whole egg"],
    tint: "from-sky-100/90 to-cyan-100/80",
  },
  dairy: {
    base: [
      "Milk skim low fat", "Milk whole", "2% reduced fat milk", "1% low fat milk",
      "Laban Ayran low salt", "Kefir", "Buttermilk low fat", "Evaporated milk", "Condensed milk",
      "Powdered milk", "Goat milk", "Sheep milk", "Buffalo milk", "Lactose free milk",
      "Chocolate milk low fat", "Strawberry milk low fat", "Vanilla low fat milk",
      "Soy milk unsweetened", "Almond milk unsweetened", "Oat milk unsweetened", "Rice milk unsweetened",
      "Cashew milk unsweetened", "Hemp milk unsweetened",
      "Yogurt plain low fat", "Yogurt plain nonfat", "Yogurt plain whole milk",
      "Greek yogurt plain nonfat", "Greek yogurt plain low fat", "Greek yogurt vanilla low fat",
      "Labneh strained yogurt", "Icelandic skyr plain",
      "Cottage cheese low fat", "Cottage cheese nonfat",
      "Ricotta part skim", "Ricotta whole milk", "Mascarpone light",
      "Cream cheese light", "Cream cheese regular",
      "Low fat cheese cubes", "American cheese light", "Feta light", "Feta regular",
      "Halloumi", "Mozzarella low moisture", "Fresh buffalo mozzarella", "String cheese low fat",
      "Ricotta salata", "Goat cheese soft", "Light crumbled feta", "Sheep cheese",
      "Light reduced fat cheddar", "Sharp regular cheddar", "Mild cheddar",
      "Light gouda", "Regular gouda", "Light swiss cheese", "Regular swiss",
      "Emmental", "Gruyere", "Parmesan grated", "Pecorino romano", "Romano cheese",
      "Asiago", "Light provolone", "Monterey jack", "Colby jack", "Light havarti",
      "Light brie", "Light camembert", "Blue cheese crumbles", "Light gorgonzola",
      "Roquefort", "Manchego", "Paneer", "Queso fresco",
      "Light cheese spread", "Cheese whiz light",
      "Ice milk light ice cream", "Light frozen yogurt", "Light gelato", "Sherbet", "Sorbet",
      "Sugar free low fat pudding", "Light custard", "Sugar free low fat flan",
      "Sugar free tapioca pudding", "Sugar free low fat rice pudding", "Light semolina pudding",
      "Small light milkshake", "Skim milk hot cocoa", "Skim milk chai latte", "Skim milk latte",
      "Skim milk cappuccino", "Milk macchiato", "Dairy base smoothie",
    ],
    portions: ["1 cup", "3/4 cup", "1/3 cup", "2 slices", "1 oz", "1 tbsp"],
    tint: "from-violet-100/90 to-fuchsia-100/70",
  },
  fat: {
    base: [
      "Olive oil", "Extra virgin olive oil", "Canola oil", "Sunflower oil", "Safflower oil",
      "Soybean oil", "Corn oil", "Vegetable oil blend", "Peanut oil", "Sesame oil",
      "Toasted sesame oil", "Walnut oil", "Almond oil", "Avocado oil", "Grape seed oil",
      "Flaxseed oil", "Pumpkin seed oil", "Virgin coconut oil", "Red palm oil",
      "Ghee clarified butter", "Butter margarine", "Salted butter", "Unsalted butter",
      "Light soft tub margarine", "Stick margarine", "Light buttery spread",
      "Light mayonnaise", "Regular mayonnaise", "Olive oil mayonnaise", "Light garlic aioli",
      "Light vinaigrette dressing", "Regular vinaigrette dressing", "Light italian dressing",
      "Light ranch dressing", "Light blue cheese dressing", "Light thousand island",
      "Balsamic glaze reduction", "Tahini", "Sesame tahini paste",
      "Hummus", "Baba ghanoush", "Mutabbal eggplant dip", "Light tzatziki",
      "Guacamole no added oil", "Salsa oil base", "Light basil pesto", "Olive tapenade spread",
      "No added oil peanut butter", "Creamy peanut butter", "Crunchy peanut butter",
      "Almond butter", "Cashew butter", "Hazelnut butter", "Walnut butter",
      "Sunflower seed butter", "Pumpkin seed butter", "Tahini sesame butter",
      "Soy nut butter", "Coconut butter manna", "Light chocolate hazelnut spread",
      "Vegetable shortening", "Rendered lard small portion", "Beef suet fat block",
      "Light oil cooking spray", "Whipped butter",
      "Avocado", "Avocado thin slices",
      "Olives black green", "Black olives", "Green olives", "Kalamata olives", "Nicoise olives",
      "Almonds", "Slivered almonds", "Almond slices",
      "Walnuts", "Roasted peanuts", "Dry roasted unsalted peanuts",
      "Pistachios", "Cashews", "Macadamia nuts", "Hazelnuts", "Pecans", "Brazil nuts",
      "Pine nuts pignoli", "Pili nuts", "Roasted unsalted chestnuts",
      "Pumpkin squash seeds", "Pepitas pumpkin seed kernels", "Sunflower seeds",
      "Sesame seeds", "Whole flax seeds", "Ground flaxseed flax meal",
      "Chia seeds", "Hemp seeds hemp hearts", "Poppy seeds",
      "Shredded unsweetened coconut", "Toasted coconut flakes",
      "Light coconut cream", "Light canned coconut milk",
      "Light sour cream", "Regular sour cream", "Soured milk clabber",
      "Light creme fraiche", "Heavy double cream", "Light whipping cream",
      "Half and half", "Light whipped cream topping", "Light non dairy creamer",
      "Imitation bacon bits", "Crispy fried onions small", "Roasted sesame seeds",
    ],
    portions: ["1 tsp", "1 tbsp", "1/8 avocado", "6 pieces", "2 tbsp", "1/2 cup"],
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
        `${base}, ${platingForDemo(category as ExchangeCategory)}, ${DEMO_AESTHETIC}`,
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
  fullName: "Novaturient Admin",
  email: "novaturient.nutritionn@gmail.com",
  role: "dietitian",
};

export const currentClient = clients[4];

export function getClientRecordForEmail(
  email?: string | null,
  userOverride?: DemoUser | null,
): ClientRecord {
  const activeUser = userOverride ?? (email ? ({ email } as DemoUser) : null);
  if (activeUser) {
    try {
      const persisted =
        useClientRecordsStore.getState().getRecord(activeUser) ??
        (activeUser.id
          ? useClientRecordsStore.getState().recordsByUserId[activeUser.id]
          : undefined);
      if (persisted && persisted.onboardingCompleted) {
        const mapped = persistedRecordToClientRecord(persisted);
        if (mapped) return mapped;
      }
    } catch (_e) {}
  }

  if (!email) {
    return currentClient;
  }

  return clients.find((client) => client.user.email === email) ?? currentClient;
}

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
      href: "/food-groups",
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
