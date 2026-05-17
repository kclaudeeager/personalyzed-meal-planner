// =============================================================================
// Recommendation Engine — Types
// =============================================================================

import type { BudgetLevel, CookingSkill, MealType } from '@meal-platform/types';

/**
 * User context fed into the scoring engine.
 */
export interface UserContext {
  userId: string;
  budgetLevel: BudgetLevel;
  cookingSkill: CookingSkill;
  dietaryPreferences: string[];
  allergies: string[];
  householdSize: number;
  /** IDs of meals the user has liked */
  likedMealIds: string[];
  /** IDs of meals recently recommended (to reduce repetition) */
  recentMealIds: string[];
  /** Maximum preparation time the user prefers (minutes) */
  maxPrepTime?: number;
}

/**
 * Meal candidate to be scored.
 */
export interface MealCandidate {
  id: string;
  title: string;
  estimatedCost: number;
  preparationTime: number;
  calories: number;
  complexity: string;
  cuisineType: string;
  tags: string[];
  ingredientNames: string[];
}

/**
 * Scored meal with breakdown.
 */
export interface ScoredMeal {
  mealId: string;
  totalScore: number;
  breakdown: ScoreBreakdown;
  mealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER';
}

/**
 * Score components for transparency.
 */
export interface ScoreBreakdown {
  preferenceMatch: number;
  budgetCompatibility: number;
  cookingTimeCompatibility: number;
  nutritionScore: number;
  historicalEngagement: number;
  repetitionPenalty: number;
}

/**
 * Recommendation request.
 */
export interface RecommendationRequest {
  userContext: UserContext;
  mealType: MealType;
  candidates: MealCandidate[];
  count: number;
}
