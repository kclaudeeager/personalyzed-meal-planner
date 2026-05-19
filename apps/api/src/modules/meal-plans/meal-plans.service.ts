import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
    });
    if (existing) {
      throw new BadRequestException('Meal plan already exists for this week');
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
    const plan = await this.findById(mealPlanId);
    const meal = await this.prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new NotFoundException('Meal not found');

    const existingIndex = plan.entries.findIndex(
      (e: { dayOfWeek: number; mealType: string }) => e.dayOfWeek === dayOfWeek && e.mealType === mealType,
    );

    if (existingIndex >= 0) {
      const existingId = plan.entries[existingIndex].id;
      return this.prisma.mealPlanEntry.update({
        where: { id: existingId },
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

    const latestRecs = await this.prisma.recommendation.findMany({
      where: {
        userId,
        createdAt: { gte: start, lte: end },
      },
      include: { meal: true },
      orderBy: { recommendationScore: 'desc' },
    });

    if (latestRecs.length === 0) {
      throw new BadRequestException('No recommendations found for this week. Generate daily recommendations first.');
    }

    const plan = await this.create(userId, weekStart, 'AI-Generated Meal Plan');

    const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER'] as const;
    for (let day = 0; day < 7; day++) {
      for (const mealType of mealTypes) {
        const rec = latestRecs.find(
          (r: { mealType: string; mealId: string }) => r.mealType === mealType && !plan.entries.some(
            (e: { mealId: string; dayOfWeek: number; mealType: string }) => e.mealId === r.mealId && e.dayOfWeek === day && e.mealType === mealType,
          ),
        );
        if (rec) {
          await this.prisma.mealPlanEntry.create({
            data: {
              mealPlanId: plan.id,
              mealId: rec.mealId,
              mealType,
              dayOfWeek: day,
              sortOrder: 0,
            },
          });
        }
      }
    }

    return this.findById(plan.id);
  }
}
