// =============================================================================
// Domain Models — Core entity interfaces
// =============================================================================

// ---------------------------------------------------------------------------
// DayOfWeek helper type
// ---------------------------------------------------------------------------

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

import type {
  AgeRange,
  ActivityLevel,
  BudgetLevel,
  Complexity,
  CookingSkill,
  CuisineType,
  FeedbackType,
  Gender,
  LocalAvailability,
  MealType,
  ValidationStatus,
  VideoSource,
} from './enums';

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  ageRange: AgeRange | null;
  gender: Gender | null;
  householdSize: number;
  budgetLevel: BudgetLevel;
  activityLevel: ActivityLevel;
  cookingSkill: CookingSkill;
  dietaryPreferences: string[];
  allergies: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Meal
// ---------------------------------------------------------------------------

export interface Meal {
  id: string;
  title: string;
  description: string;
  preparationTime: number; // in minutes
  estimatedCost: number; // in RWF
  calories: number;
  cuisineType: CuisineType;
  complexity: Complexity;
  tags: string[];
  mealTypes: MealType[];
  accompaniments: string | null;
  notes: string | null;
  imageUrl: string | null;
  createdById: string | null;
  validationStatus: ValidationStatus;
  validatedById: string | null;
  validationComment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeStep {
  id: string;
  mealId: string;
  stepNumber: number;
  instruction: string;
}

// ---------------------------------------------------------------------------
// Ingredient
// ---------------------------------------------------------------------------

export interface Ingredient {
  id: string;
  name: string;
  localAvailability: LocalAvailability;
  averageCost: number; // in RWF
}

// ---------------------------------------------------------------------------
// MealIngredient (join)
// ---------------------------------------------------------------------------

export interface MealIngredient {
  mealId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
}

// ---------------------------------------------------------------------------
// Nutrition Profile
// ---------------------------------------------------------------------------

export interface NutritionProfile {
  id: string;
  mealId: string;
  protein: number; // grams
  carbs: number;
  fat: number;
  fiber: number;
  vitamins: string | null; // JSON or text summary
}

// ---------------------------------------------------------------------------
// Video Reference
// ---------------------------------------------------------------------------

export interface VideoReference {
  id: string;
  mealId: string;
  url: string;
  source: VideoSource;
  title: string;
  creatorName: string | null;
}

// ---------------------------------------------------------------------------
// Recommendation
// ---------------------------------------------------------------------------

export interface Recommendation {
  id: string;
  userId: string;
  mealId: string;
  recommendationScore: number;
  mealType: MealType;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export interface Feedback {
  id: string;
  userId: string;
  mealId: string;
  rating: number; // 1-5
  feedbackType: FeedbackType;
  comment: string | null;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// User Preference
// ---------------------------------------------------------------------------

export interface UserPreference {
  id: string;
  userId: string;
  preferenceKey: string;
  preferenceValue: string;
}

// ---------------------------------------------------------------------------
// Health Metric
// ---------------------------------------------------------------------------

export interface HealthMetric {
  id: string;
  userId: string;
  metricType: string;
  value: number;
  recordedAt: Date;
}

// ---------------------------------------------------------------------------
// Meal Plan
// ---------------------------------------------------------------------------

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealPlanEntry {
  id: string;
  mealPlanId: string;
  mealId: string;
  mealType: MealType;
  dayOfWeek: DayOfWeek;
  sortOrder: number;
}

// ---------------------------------------------------------------------------
// Shopping List
// ---------------------------------------------------------------------------

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  weekStart: Date | null;
  weekEnd: Date | null;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingListItem {
  id: string;
  shoppingListId: string;
  ingredientId: string | null;
  ingredientName: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  isChecked: boolean;
}
