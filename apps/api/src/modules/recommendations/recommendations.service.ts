// =============================================================================
// Recommendations Service — Orchestrates the recommendation engine
// =============================================================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MealsService } from '../meals/meals.service';
import { UsersService } from '../users/users.service';
import { recommend } from '@meal-platform/recommendation-engine';
import type { MealCandidate, UserContext } from '@meal-platform/recommendation-engine';
import { MAX_RECOMMENDATIONS_PER_MEAL_TYPE } from '@meal-platform/shared';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mealsService: MealsService,
    private readonly usersService: UsersService,
  ) {}

  async getDailyRecommendations(userId: string) {
    // 1. Fetch user context
    const user = await this.usersService.findById(userId);

    // 2. Get liked meals
    const likedFeedback = await this.prisma.feedback.findMany({
      where: { userId, feedbackType: 'LIKED' },
      select: { mealId: true },
    });
    const likedMealIds = likedFeedback.map((f) => f.mealId);

    // 3. Get recently recommended meals (last 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const recentRecs = await this.prisma.recommendation.findMany({
      where: { userId, createdAt: { gte: threeDaysAgo } },
      select: { mealId: true },
    });
    const recentMealIds = recentRecs.map((r) => r.mealId);

    // 4. Build user context
    const userContext: UserContext = {
      userId: user.id,
      budgetLevel: user.budgetLevel as UserContext['budgetLevel'],
      cookingSkill: user.cookingSkill as UserContext['cookingSkill'],
      dietaryPreferences: user.dietaryPreferences,
      allergies: user.allergies,
      householdSize: user.householdSize,
      likedMealIds,
      recentMealIds,
    };

    // 5. Fetch all meal candidates
    const rawMeals = await this.mealsService.getMealCandidates();
    const candidates: MealCandidate[] = rawMeals.map((m) => ({
      id: m.id,
      title: m.title,
      estimatedCost: m.estimatedCost,
      preparationTime: m.preparationTime,
      calories: m.calories,
      complexity: m.complexity,
      cuisineType: m.cuisineType,
      tags: m.tags,
      ingredientNames: m.ingredients.map((mi) => mi.ingredient.name),
    }));

    // 6. Run recommendation engine for each meal type
    const count = MAX_RECOMMENDATIONS_PER_MEAL_TYPE;
    const breakfast = recommend(candidates, userContext, count);
    const lunch = recommend(candidates, userContext, count);
    const dinner = recommend(candidates, userContext, count);

    // 7. Persist recommendations
    const allRecs = [
      ...breakfast.map((r) => ({ ...r, mealType: 'BREAKFAST' as const })),
      ...lunch.map((r) => ({ ...r, mealType: 'LUNCH' as const })),
      ...dinner.map((r) => ({ ...r, mealType: 'DINNER' as const })),
    ];

    await this.prisma.recommendation.createMany({
      data: allRecs.map((r) => ({
        userId,
        mealId: r.mealId,
        recommendationScore: r.totalScore,
        mealType: r.mealType,
      })),
    });

    // 8. Return with meal details
    const mealMap = new Map(rawMeals.map((m) => [m.id, m]));
    const enrich = (scored: typeof breakfast) =>
      scored.map((s) => ({
        score: s.totalScore,
        breakdown: s.breakdown,
        meal: mealMap.get(s.mealId),
      }));

    return {
      date: new Date().toISOString().split('T')[0],
      breakfast: enrich(breakfast),
      lunch: enrich(lunch),
      dinner: enrich(dinner),
    };
  }
}
