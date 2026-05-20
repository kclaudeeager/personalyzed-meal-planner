import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface MealSuggestion {
  dayOfWeek: number;
  mealType: string;
  suggestions: Array<{
    meal: Record<string, unknown>;
    reason: string;
  }>;
}

@Injectable()
export class MealPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, weekStart: string, name?: string) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const existing = await this.prisma.mealPlan.findUnique({
      where: { userId_weekStart: { userId, weekStart: start } },
      include: {
        entries: {
          include: { meal: true },
          orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }, { sortOrder: 'asc' }],
        },
      },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.mealPlan.create({
      data: {
        userId,
        weekStart: start,
        weekEnd: end,
        name: name ?? 'Weekly Meal Plan',
        entries: {
          create: [],
        },
      },
      include: {
        entries: {
          include: { meal: true },
          orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }, { sortOrder: 'asc' }],
        },
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.mealPlan.findMany({
      where: { userId },
      include: {
        entries: {
          include: { meal: true },
          orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }, { sortOrder: 'asc' }],
        },
      },
      orderBy: { weekStart: 'desc' },
    });
  }

  async findById(id: string) {
    const plan = await this.prisma.mealPlan.findUnique({
      where: { id },
      include: {
        entries: {
          include: { meal: true },
          orderBy: [{ dayOfWeek: 'asc' }, { mealType: 'asc' }, { sortOrder: 'asc' }],
        },
      },
    });
    if (!plan) throw new NotFoundException('Meal plan not found');
    return plan;
  }

  async setEntry(mealPlanId: string, mealId: string, mealType: string, dayOfWeek: number) {
    const plan = await this.prisma.mealPlan.findUnique({ where: { id: mealPlanId } });
    if (!plan) throw new NotFoundException('Meal plan not found');

    const meal = await this.prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new NotFoundException('Meal not found');

    // Direct query for existing entry instead of iterating
    const existing = await this.prisma.mealPlanEntry.findFirst({
      where: { mealPlanId, mealType: mealType as any, dayOfWeek },
    });

    if (existing) {
      return this.prisma.mealPlanEntry.update({
        where: { id: existing.id },
        data: { mealId },
        include: { meal: true },
      });
    }

    return this.prisma.mealPlanEntry.create({
      data: {
        mealPlanId,
        mealId,
        mealType: mealType as 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK',
        dayOfWeek,
        sortOrder: 0,
      },
      include: { meal: true },
    });
  }

  async removeEntry(entryId: string) {
    return this.prisma.mealPlanEntry.delete({ where: { id: entryId } });
  }

  async generateFromRecommendations(userId: string, weekStart: string) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    // Get or create meal plan for this week
    let plan = await this.prisma.mealPlan.findUnique({
      where: { userId_weekStart: { userId, weekStart: start } },
    });

    if (plan) {
      // Delete existing entries to regenerate
      await this.prisma.mealPlanEntry.deleteMany({ where: { mealPlanId: plan.id } });
    } else {
      plan = await this.prisma.mealPlan.create({
        data: {
          userId,
          weekStart: start,
          weekEnd: end,
          name: 'AI-Generated Meal Plan',
        },
      });
    }

    // Try to get recommendations first
    const latestRecs = await this.prisma.recommendation.findMany({
      where: {
        userId,
        createdAt: { gte: start, lte: end },
      },
      include: { meal: true },
      orderBy: { recommendationScore: 'desc' },
    });

    // Fallback: use all approved meals if no recommendations
    const allMeals = latestRecs.length > 0
      ? latestRecs.map((r) => r.meal)
      : await this.prisma.meal.findMany({
          where: { validationStatus: 'APPROVED' },
        });

    const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
    const usedMealIds = new Set<string>();

    for (let day = 0; day < 7; day++) {
      for (const mealType of mealTypes) {
        // Find meals matching this meal type
        const candidates = allMeals.filter((m) => {
          if (usedMealIds.has(m.id)) return false;
          const types = (m as any).mealTypes as string[] | undefined;
          if (types && types.length > 0 && !types.includes(mealType)) return false;
          return true;
        });

        // If no type-filtered meals, allow any meal of any type
        const pool = candidates.length > 0 ? candidates : allMeals.filter((m) => !usedMealIds.has(m.id));
        if (pool.length === 0) continue;

        const chosen = pool[Math.floor(Math.random() * pool.length)];
        usedMealIds.add(chosen.id);

        await this.prisma.mealPlanEntry.create({
          data: {
            mealPlanId: plan.id,
            mealId: chosen.id,
            mealType,
            dayOfWeek: day,
            sortOrder: 0,
          },
        });
      }
    }

    return this.findById(plan.id);
  }

  async suggestMeals(userId: string, weekStart: string) {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const plan = await this.prisma.mealPlan.findUnique({
      where: { userId_weekStart: { userId, weekStart: start } },
      include: {
        entries: {
          include: { meal: { include: { ingredients: { include: { ingredient: true } } } } },
        },
      },
    });

    const allMeals = await this.prisma.meal.findMany({
      include: {
        ingredients: { include: { ingredient: true } },
      },
    });

    const plannedMealIds = new Set(plan?.entries.map((e: { mealId: string }) => e.mealId) ?? []);
    const plannedIngredientIds = new Set<string>();
    for (const entry of plan?.entries ?? []) {
      for (const mi of entry.meal.ingredients) {
        plannedIngredientIds.add(mi.ingredientId);
      }
    }

    const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
    const suggestions: MealSuggestion[] = [];

    for (let day = 0; day < 7; day++) {
      for (const mealType of mealTypes) {
        const existingEntry = plan?.entries.find(
          (e: { dayOfWeek: number; mealType: string }) => e.dayOfWeek === day && e.mealType === mealType,
        );
        if (existingEntry) continue;

        const candidates = allMeals
          .filter((m: Record<string, unknown>) => {
            if (plannedMealIds.has(m.id as string)) return false;
            const types = m.mealTypes as string[];
            if (types && types.length > 0 && !types.includes(mealType)) return false;
            return true;
          })
          .map((m: Record<string, unknown>) => {
            const mealIngredients = (m as any).ingredients as Array<{ ingredientId: string }>;
            const overlapCount = mealIngredients.filter(
              (mi: { ingredientId: string }) => plannedIngredientIds.has(mi.ingredientId),
            ).length;
            return { meal: m, overlapCount };
          })
          .sort((a: { overlapCount: number }, b: { overlapCount: number }) => b.overlapCount - a.overlapCount)
          .slice(0, 5);

        suggestions.push({
          dayOfWeek: day,
          mealType,
          suggestions: candidates.map((c: { meal: Record<string, unknown>; overlapCount: number }) => ({
            meal: c.meal,
            reason: c.overlapCount > 0
              ? `Shares ${c.overlapCount} ingredient(s) with planned meals`
              : 'Variety pick — no overlap with current week',
          })),
        });
      }
    }

    return suggestions;
  }
}
