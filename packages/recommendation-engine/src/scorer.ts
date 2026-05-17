// =============================================================================
// Recommendation Engine — Rule-Based Scoring (Phase 1)
// =============================================================================

import { BUDGET_THRESHOLDS } from '@meal-platform/shared';
import type {
  MealCandidate,
  ScoreBreakdown,
  ScoredMeal,
  UserContext,
} from './types';

// ---------------------------------------------------------------------------
// Score Weights — Tunable parameters
// ---------------------------------------------------------------------------

const WEIGHTS = {
  preferenceMatch: 0.25,
  budgetCompatibility: 0.20,
  cookingTimeCompatibility: 0.20,
  nutritionScore: 0.15,
  historicalEngagement: 0.15,
  repetitionPenalty: 0.05,
} as const;

// ---------------------------------------------------------------------------
// Individual Scoring Functions
// ---------------------------------------------------------------------------

/**
 * Score how well the meal matches user dietary preferences and tags.
 * Returns 0-1.
 */
export function scorePreferenceMatch(
  meal: MealCandidate,
  userContext: UserContext,
): number {
  if (userContext.dietaryPreferences.length === 0) return 0.5; // neutral

  const matchCount = userContext.dietaryPreferences.filter(
    (pref) =>
      meal.tags.some((tag) => tag.toLowerCase().includes(pref.toLowerCase())) ||
      meal.ingredientNames.some((ing) => ing.toLowerCase().includes(pref.toLowerCase())),
  ).length;

  // Check for allergens — hard disqualifier
  const hasAllergen = userContext.allergies.some((allergy) =>
    meal.ingredientNames.some((ing) => ing.toLowerCase().includes(allergy.toLowerCase())),
  );
  if (hasAllergen) return -1; // disqualify

  return Math.min(matchCount / Math.max(userContext.dietaryPreferences.length, 1), 1);
}

/**
 * Score how well the meal fits the user's budget.
 * Returns 0-1.
 */
export function scoreBudgetCompatibility(
  meal: MealCandidate,
  userContext: UserContext,
): number {
  const threshold = BUDGET_THRESHOLDS[userContext.budgetLevel];
  const perPersonCost = meal.estimatedCost / Math.max(userContext.householdSize, 1);

  if (perPersonCost <= threshold.max) {
    // Within budget — higher score for cheaper meals
    const ratio = perPersonCost / threshold.max;
    return 1 - ratio * 0.3; // 0.7 - 1.0
  }

  // Over budget — penalty
  const overageRatio = perPersonCost / threshold.max;
  return Math.max(0, 1 - overageRatio);
}

/**
 * Score cooking time compatibility.
 * Returns 0-1.
 */
export function scoreCookingTimeCompatibility(
  meal: MealCandidate,
  userContext: UserContext,
): number {
  const maxTime = userContext.maxPrepTime ?? 60; // default 1 hour
  if (meal.preparationTime <= maxTime) {
    return 1 - (meal.preparationTime / maxTime) * 0.2; // slight preference for quicker
  }
  // Over time — gradual penalty
  return Math.max(0, 1 - (meal.preparationTime - maxTime) / maxTime);
}

/**
 * Score based on nutritional value (simplified — calorie-based for now).
 * Returns 0-1.
 */
export function scoreNutrition(meal: MealCandidate): number {
  // Prefer meals in 300-800 calorie range per serving
  if (meal.calories >= 300 && meal.calories <= 800) return 1;
  if (meal.calories < 300) return meal.calories / 300;
  return Math.max(0, 1 - (meal.calories - 800) / 800);
}

/**
 * Score based on historical engagement (liked meals).
 * Returns 0-1.
 */
export function scoreHistoricalEngagement(
  meal: MealCandidate,
  userContext: UserContext,
): number {
  if (userContext.likedMealIds.includes(meal.id)) return 1;
  return 0.5; // neutral for unknown meals
}

/**
 * Penalty for recently recommended meals (reduce repetition).
 * Returns 0-1 (1 = no penalty).
 */
export function scoreRepetitionPenalty(
  meal: MealCandidate,
  userContext: UserContext,
): number {
  if (userContext.recentMealIds.includes(meal.id)) return 0;
  return 1;
}

// ---------------------------------------------------------------------------
// Main Scoring Function
// ---------------------------------------------------------------------------

/**
 * Score a single meal candidate for a user context.
 */
export function scoreMeal(meal: MealCandidate, userContext: UserContext): ScoredMeal {
  const preferenceMatch = scorePreferenceMatch(meal, userContext);

  // Hard disqualifier: allergen detected
  if (preferenceMatch < 0) {
    return {
      mealId: meal.id,
      totalScore: -1,
      breakdown: {
        preferenceMatch: 0,
        budgetCompatibility: 0,
        cookingTimeCompatibility: 0,
        nutritionScore: 0,
        historicalEngagement: 0,
        repetitionPenalty: 0,
      },
    };
  }

  const breakdown: ScoreBreakdown = {
    preferenceMatch,
    budgetCompatibility: scoreBudgetCompatibility(meal, userContext),
    cookingTimeCompatibility: scoreCookingTimeCompatibility(meal, userContext),
    nutritionScore: scoreNutrition(meal),
    historicalEngagement: scoreHistoricalEngagement(meal, userContext),
    repetitionPenalty: scoreRepetitionPenalty(meal, userContext),
  };

  const totalScore =
    breakdown.preferenceMatch * WEIGHTS.preferenceMatch +
    breakdown.budgetCompatibility * WEIGHTS.budgetCompatibility +
    breakdown.cookingTimeCompatibility * WEIGHTS.cookingTimeCompatibility +
    breakdown.nutritionScore * WEIGHTS.nutritionScore +
    breakdown.historicalEngagement * WEIGHTS.historicalEngagement +
    breakdown.repetitionPenalty * WEIGHTS.repetitionPenalty;

  return {
    mealId: meal.id,
    totalScore,
    breakdown,
  };
}

// ---------------------------------------------------------------------------
// Batch Recommendation
// ---------------------------------------------------------------------------

/**
 * Score all candidates and return the top N recommendations.
 */
export function recommend(
  candidates: MealCandidate[],
  userContext: UserContext,
  count: number = 5,
): ScoredMeal[] {
  return candidates
    .map((meal) => scoreMeal(meal, userContext))
    .filter((scored) => scored.totalScore > 0) // remove disqualified
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, count);
}
