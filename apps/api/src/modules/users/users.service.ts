// =============================================================================
// Users Service — Business logic for user management
// =============================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdatePreferencesDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByClerkId(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        clerkId: dto.clerkId,
        email: dto.email,
        fullName: dto.fullName,
      },
    });
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    // Verify user exists
    await this.findById(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: { ...dto },
    });
  }

  async getUserWithPreferences(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        healthMetrics: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
