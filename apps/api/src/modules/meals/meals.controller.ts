// =============================================================================
// Meals Controller — REST endpoints for meal catalog
// =============================================================================

import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MealsService } from './meals.service';
import { CreateMealDto, MealQueryDto } from './meals.dto';

@ApiTags('meals')
@Controller('meals')
export class MealsController {
  constructor(private readonly mealsService: MealsService) {}

  @Get()
  @ApiOperation({ summary: 'List meals with optional filters' })
  async findAll(@Query() query: MealQueryDto) {
    const result = await this.mealsService.findAll(query);
    return { success: true, ...result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meal details with ingredients, nutrition, and videos' })
  async findOne(@Param('id') id: string) {
    const meal = await this.mealsService.findById(id);
    return { success: true, data: meal };
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new meal' })
  async create(@Body() dto: CreateMealDto) {
    const meal = await this.mealsService.create(dto);
    return { success: true, data: meal };
  }
}
