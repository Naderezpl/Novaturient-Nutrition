export type UserRole = "client" | "dietitian";

export type ExchangeCategory =
  | "starch"
  | "fruit"
  | "vegetable"
  | "protein"
  | "dairy"
  | "fat";

export type ClientGoal = "fat_loss" | "maintenance" | "muscle_gain";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type DemoUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  age?: number;
  sex?: "female" | "male";
  heightCm?: number;
  weightKg?: number;
  goal?: ClientGoal;
  activityLevel?: ActivityLevel;
  joinDate?: string;
};

export type ExchangePlan = Record<ExchangeCategory, number>;

export type FoodItem = {
  id: string;
  name: string;
  category: ExchangeCategory;
  servingSize: string;
  exchanges: number;
  imageUrl: string;
  equivalentFoods: string[];
  learningTip: string;
  keywords: string[];
};

export type MealEntry = {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foods: string[];
  exchanges: Partial<ExchangePlan>;
  calories: number;
  loggedAt: string;
  notes?: string;
};

export type Lesson = {
  slug: string;
  title: string;
  topic: string;
  summary: string;
  illustrationUrl: string;
  tips: string[];
  takeaways: string[];
};

export type AdherencePoint = {
  day: string;
  adherence: number;
  waterMl: number;
  weightKg: number;
};

export type MotivationalMessage = {
  title: string;
  body: string;
};

export type ClientRecord = {
  user: DemoUser;
  plan: ExchangePlan;
  adherence: AdherencePoint[];
  recentMeals: MealEntry[];
  waterGoalMl: number;
};

export type SearchResult = {
  id: string;
  type: "food" | "lesson" | "client" | "meal";
  title: string;
  subtitle: string;
  href: string;
};

export type CoachPrompt = {
  id: string;
  title: string;
  prompt: string;
};
