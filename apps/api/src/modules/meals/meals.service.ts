// =============================================================================
// Meals Service — Business logic for meal catalog
// =============================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { paginate } from '@meal-platform/shared';
import { CreateMealDto, MealQueryDto } from './meals.dto';

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: MealQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query.cuisineType) where.cuisineType = query.cuisineType;
    if (query.complexity) where.complexity = query.complexity;
    if (query.maxPreparationTime) {
      where.preparationTime = { lte: query.maxPreparationTime };
    }
    if (query.maxCost) {
      where.estimatedCost = { lte: query.maxCost };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [meals, total] = await Promise.all([
      this.prisma.meal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          nutritionProfile: true,
          _count: { select: { feedback: true } },
        },
      }),
      this.prisma.meal.count({ where }),
    ]);

    return {
      data: meals,
      meta: paginate(total, page, limit),
    };
  }

  async findById(id: string) {
    const meal = await this.prisma.meal.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: { ingredient: true },
        },
        nutritionProfile: true,
        videos: true,
        _count: { select: { feedback: true, recommendations: true } },
      },
    });
    if (!meal) throw new NotFoundException('Meal not found');
    return meal;
  }

  async create(dto: CreateMealDto) {
    return this.prisma.meal.create({
      data: {
        title: dto.title,
        description: dto.description,
        preparationTime: dto.preparationTime,
        estimatedCost: dto.estimatedCost,
        calories: dto.calories,
        cuisineType: dto.cuisineType ?? 'RWANDAN',
        complexity: dto.complexity ?? 'MEDIUM',
        tags: dto.tags ?? [],
        imageUrl: dto.imageUrl,
      },
    });
  }

  async getMealCandidates() {
    return this.prisma.meal.findMany({
      include: {
        ingredients: {
          include: { ingredient: true },
        },
      },
    });
  }
}
