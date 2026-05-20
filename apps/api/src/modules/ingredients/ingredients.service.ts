import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIngredientDto } from './ingredients.dto';

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(q: string) {
    return this.prisma.ingredient.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
      take: 20,
    });
  }

  async create(dto: CreateIngredientDto) {
    const existing = await this.prisma.ingredient.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Ingredient "${dto.name}" already exists`);
    }

    return this.prisma.ingredient.create({
      data: {
        name: dto.name,
        localAvailability: dto.localAvailability ?? 'COMMON',
        averageCost: dto.averageCost ?? 0,
      },
    });
  }

  async findOrCreate(name: string) {
    const existing = await this.prisma.ingredient.findUnique({
      where: { name },
    });
    if (existing) return existing;

    return this.prisma.ingredient.create({
      data: {
        name,
        localAvailability: 'COMMON',
        averageCost: 0,
      },
    });
  }
}
