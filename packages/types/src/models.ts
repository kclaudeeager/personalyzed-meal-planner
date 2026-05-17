// =============================================================================
// Domain Models — Core entity interfaces
// =============================================================================

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
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
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
