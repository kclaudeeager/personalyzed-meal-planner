// =============================================================================
// Meals Service — Business logic for meal catalog
// =============================================================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IngredientsService } from '../ingredients/ingredients.service';
import { paginate } from '@meal-platform/shared';
import { CreateMealDto, MealQueryDto, UpdateMealDto, AddVideoDto, ValidateMealDto } from './meals.dto';

@Injectable()
export class MealsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ingredientsService: IngredientsService,
  ) {}

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
    if (!query.includePending) {
      where.validationStatus = 'APPROVED';
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
        images: { orderBy: { createdAt: 'asc' } },
        ingredients: {
          include: { ingredient: true },
        },
        nutritionProfile: true,
        steps: { orderBy: { stepNumber: 'asc' } },
        videos: { orderBy: { id: 'asc' } },
        createdBy: { select: { id: true, fullName: true, email: true } },
        _count: { select: { feedback: true, recommendations: true } },
      },
    });
    if (!meal) throw new NotFoundException('Meal not found');
    return meal;
  }

  async create(dto: CreateMealDto, createdById?: string) {
    const { ingredients, steps, ...mealData } = dto;

    const meal = await this.prisma.meal.create({
      data: {
        title: mealData.title,
        description: mealData.description,
        preparationTime: mealData.preparationTime,
        estimatedCost: mealData.estimatedCost,
        calories: mealData.calories,
        cuisineType: mealData.cuisineType ?? 'RWANDAN',
        complexity: mealData.complexity ?? 'MEDIUM',
        tags: mealData.tags ?? [],
        mealTypes: mealData.mealTypes ?? [],
        accompaniments: mealData.accompaniments,
        notes: mealData.notes,
        imageUrl: mealData.imageUrl,
        createdById: createdById,
      },
    });

    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        const ingredient = await this.ingredientsService.findOrCreate(ing.name);
        await this.prisma.mealIngredient.create({
          data: {
            mealId: meal.id,
            ingredientId: ingredient.id,
            quantity: ing.quantity,
            unit: ing.unit,
          },
        });
      }
    }

    if (steps && steps.length > 0) {
      await this.prisma.recipeStep.createMany({
        data: steps.map((s, i) => ({
          mealId: meal.id,
          stepNumber: i + 1,
          instruction: s.instruction,
        })),
      });
    }

    return this.findById(meal.id);
  }

  async update(id: string, dto: UpdateMealDto) {
    const meal = await this.prisma.meal.findUnique({ where: { id } });
    if (!meal) throw new NotFoundException('Meal not found');

    return this.prisma.meal.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.preparationTime !== undefined && { preparationTime: dto.preparationTime }),
        ...(dto.estimatedCost !== undefined && { estimatedCost: dto.estimatedCost }),
        ...(dto.calories !== undefined && { calories: dto.calories }),
        ...(dto.cuisineType !== undefined && { cuisineType: dto.cuisineType }),
        ...(dto.complexity !== undefined && { complexity: dto.complexity }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.mealTypes !== undefined && { mealTypes: dto.mealTypes }),
        ...(dto.accompaniments !== undefined && { accompaniments: dto.accompaniments }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
      },
      include: {
        ingredients: { include: { ingredient: true } },
        nutritionProfile: true,
        steps: { orderBy: { stepNumber: 'asc' } },
        videos: true,
      },
    });
  }

  async addVideo(mealId: string, dto: AddVideoDto) {
    const meal = await this.prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new NotFoundException('Meal not found');

    return this.prisma.videoReference.create({
      data: {
        mealId,
        url: dto.url,
        source: dto.source as any,
        title: dto.title,
        creatorName: dto.creatorName,
      },
    });
  }

  async addImages(mealId: string, files: Express.Multer.File[]) {
    const meal = await this.prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new NotFoundException('Meal not found');

    const records = files.map((f) => ({
      mealId,
      url: `/uploads/${f.filename}`,
    }));

    await this.prisma.mealImage.createMany({ data: records });

    return this.prisma.mealImage.findMany({
      where: { mealId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addImageUrls(mealId: string, urls: string[]) {
    const meal = await this.prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new NotFoundException('Meal not found');

    const records = urls.map((url) => ({ mealId, url }));
    await this.prisma.mealImage.createMany({ data: records });

    return this.prisma.mealImage.findMany({
      where: { mealId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteImage(imageId: string) {
    const image = await this.prisma.mealImage.findUnique({ where: { id: imageId } });
    if (!image) throw new NotFoundException('Image not found');
    await this.prisma.mealImage.delete({ where: { id: imageId } });
    return { deleted: true };
  }

  async addVideos(mealId: string, dtos: AddVideoDto[]) {
    const meal = await this.prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new NotFoundException('Meal not found');

    await this.prisma.videoReference.createMany({
      data: dtos.map((dto) => ({
        mealId,
        url: dto.url,
        source: dto.source as any,
        title: dto.title,
        creatorName: dto.creatorName,
      })),
    });

    return this.prisma.videoReference.findMany({
      where: { mealId },
      orderBy: { id: 'asc' },
    });
  }

  async deleteVideo(videoId: string) {
    const video = await this.prisma.videoReference.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');
    await this.prisma.videoReference.delete({ where: { id: videoId } });
    return { deleted: true };
  }

  async uploadMedia(mealId: string, file: Express.Multer.File, title?: string, creatorName?: string) {
    const meal = await this.prisma.meal.findUnique({ where: { id: mealId } });
    if (!meal) throw new NotFoundException('Meal not found');

    const url = `/uploads/${file.filename}`;

    if (file.mimetype.match(/^image\//)) {
      const image = await this.prisma.mealImage.create({
        data: { mealId, url },
      });
      return { data: image, type: 'image' };
    }

    const video = await this.prisma.videoReference.create({
      data: {
        mealId,
        url,
        source: 'ORIGINAL',
        title: title || file.originalname,
        creatorName: creatorName || null,
      },
    });
    return { data: video, type: 'video' };
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

  async generateShoppingList(mealPlanId: string) {
    const plan = await this.prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: {
        entries: {
          include: {
            meal: {
              include: {
                ingredients: {
                  include: { ingredient: true },
                },
              },
            },
          },
        },
        user: true,
      },
    });
    if (!plan) throw new NotFoundException('Meal plan not found');

    // Helper: convert quantity to the unit that averageCost is based on
    // averageCost is per kg for weight, per L for volume, per piece for countable
    function toCostUnit(qty: number, unit: string): number {
      const u = unit.toLowerCase();
      if (['g', 'grams'].includes(u)) return qty / 1000;
      if (['ml'].includes(u)) return qty / 1000;
      if (['kg', 'l', 'liters', 'liter'].includes(u)) return qty;
      if (['cups', 'cup'].includes(u)) return qty * 0.24; // ~0.24 L per cup
      if (['tbsp', 'tablespoon', 'tablespoons'].includes(u)) return qty * 0.015; // ~15 ml
      if (['tsp', 'teaspoon', 'teaspoons'].includes(u)) return qty * 0.005; // ~5 ml
      return qty; // pieces, units, to taste — leave as-is
    }

    const ingredientMap = new Map<string, {
      name: string;
      quantity: number;
      unit: string;
      cost: number;
      ingredientId: string | null;
    }>();

    for (const entry of plan.entries) {
      const householdSize = plan.user.householdSize;
      for (const mi of entry.meal.ingredients) {
        const key = `${mi.ingredient.name}-${mi.unit}`;
        const scaledQty = mi.quantity * householdSize;
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.quantity += scaledQty;
          existing.cost += mi.ingredient.averageCost * toCostUnit(scaledQty, mi.unit);
        } else {
          ingredientMap.set(key, {
            name: mi.ingredient.name,
            quantity: scaledQty,
            unit: mi.unit,
            cost: mi.ingredient.averageCost * toCostUnit(scaledQty, mi.unit),
            ingredientId: mi.ingredient.id,
          });
        }
      }
    }

    const items = Array.from(ingredientMap.values()).map((item) => ({
      ingredientId: item.ingredientId,
      ingredientName: item.name,
      quantity: Math.round(item.quantity * 100) / 100,
      unit: item.unit,
      estimatedCost: Math.round(item.cost * 100) / 100,
      isChecked: false,
    }));

    const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);

    const shoppingList = await this.prisma.shoppingList.create({
      data: {
        userId: plan.userId,
        name: `Shopping List — ${plan.name}`,
        weekStart: plan.weekStart,
        weekEnd: plan.weekEnd,
        totalCost,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });

    return shoppingList;
  }

  async validate(id: string, dto: ValidateMealDto, validatedById: string) {
    const meal = await this.prisma.meal.findUnique({ where: { id } });
    if (!meal) throw new NotFoundException('Meal not found');

    return this.prisma.meal.update({
      where: { id },
      data: {
        validationStatus: dto.status,
        validatedById,
        validationComment: dto.comment,
      },
      include: {
        ingredients: { include: { ingredient: true } },
        nutritionProfile: true,
        steps: { orderBy: { stepNumber: 'asc' } },
        videos: true,
        createdBy: { select: { id: true, fullName: true, email: true } },
        validatedBy: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async importFromUrl(url: string) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MealPlatformBot/1.0)',
          Accept: 'text/html,application/json',
        },
      });

      if (!response.ok) {
        throw new BadRequestException(`Failed to fetch URL: ${response.statusText}`);
      }

      const html = await response.text();

      let title = 'Imported Meal';
      let description = '';
      let prepTime = 30;
      let cost = 3000;
      let calories = 400;
      let tags: string[] = ['imported'];

      const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
      let match;
      while ((match = jsonLdRegex.exec(html)) !== null) {
        try {
          const data = JSON.parse(match[1]);
          const recipes = Array.isArray(data) ? data.filter((d) => d['@type'] === 'Recipe') : data['@type'] === 'Recipe' ? [data] : [];
          for (const recipe of recipes) {
            title = recipe.name ?? title;
            description = recipe.description ?? description;
            if (recipe.totalTime) {
              const timeMatch = recipe.totalTime.match(/\d+/);
              if (timeMatch) prepTime = parseInt(timeMatch[0]);
            }
            if (recipe.calories) {
              const calMatch = recipe.calories.toString().match(/\d+/);
              if (calMatch) calories = parseInt(calMatch[0]);
            }
            if (recipe.recipeCuisine) {
              tags = [...tags, ...(Array.isArray(recipe.recipeCuisine) ? recipe.recipeCuisine : [recipe.recipeCuisine])];
            }
            if (recipe.keywords) {
              tags = [...tags, ...(Array.isArray(recipe.keywords) ? recipe.keywords : [recipe.keywords])];
            }
            tags = [...new Set(tags.map((t: string) => t.toLowerCase().trim()))];
          }
        } catch {
          continue;
        }
      }

      if (title === 'Imported Meal') {
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        if (titleMatch) title = titleMatch[1].trim();
      }

      const meal = await this.prisma.meal.create({
        data: {
          title,
          description: description.slice(0, 500),
          preparationTime: prepTime,
          estimatedCost: cost,
          calories,
          cuisineType: 'INTERNATIONAL',
          complexity: 'MEDIUM',
          tags,
        },
      });

      return {
        meal,
        message: `Imported "${title}" from URL`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Failed to import recipe: ${(error as Error).message}`);
    }
  }
}
