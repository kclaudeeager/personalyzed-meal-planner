import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MealPlansService, MealSuggestion } from './meal-plans.service';
import { CreateMealPlanDto, SetMealPlanEntryDto, SuggestMealsDto } from './meal-plans.dto';

@ApiTags('meal-plans')
@ApiBearerAuth()
@Controller('meal-plans')
export class MealPlansController {
  constructor(private readonly mealPlansService: MealPlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a weekly meal plan' })
  @ApiQuery({ name: 'userId', required: true })
  async create(@Query('userId') userId: string, @Body() dto: CreateMealPlanDto) {
    const plan = await this.mealPlansService.create(userId, dto.weekStart, dto.name);
    return { success: true, data: plan };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get meal plans for a user' })
  async findByUser(@Param('userId') userId: string) {
    const plans = await this.mealPlansService.findByUser(userId);
    return { success: true, data: plans };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meal plan by ID' })
  async findOne(@Param('id') id: string) {
    const plan = await this.mealPlansService.findById(id);
    return { success: true, data: plan };
  }

  @Post('entry')
  @ApiOperation({ summary: 'Set a meal plan entry (create or update by day+type)' })
  async setEntry(@Body() dto: SetMealPlanEntryDto) {
    const entry = await this.mealPlansService.setEntry(
      dto.mealPlanId,
      dto.mealId,
      dto.mealType,
      dto.dayOfWeek,
    );
    return { success: true, data: entry };
  }

  @Delete('entry/:entryId')
  @ApiOperation({ summary: 'Remove a meal plan entry' })
  async removeEntry(@Param('entryId') entryId: string) {
    await this.mealPlansService.removeEntry(entryId);
    return { success: true };
  }

  @Post('generate/:userId')
  @ApiOperation({ summary: 'Generate meal plan from latest recommendations' })
  async generateFromRecommendations(
    @Param('userId') userId: string,
    @Body() body: { weekStart?: string },
  ) {
    if (!body.weekStart) {
      return { success: false, message: 'weekStart is required' };
    }
    const plan = await this.mealPlansService.generateFromRecommendations(userId, body.weekStart);
    return { success: true, data: plan };
  }

  @Get('suggestions/:userId')
  @ApiOperation({ summary: 'Get smart meal suggestions for unfilled slots in the week' })
  @ApiQuery({ name: 'weekStart', required: true })
  async suggestMeals(
    @Param('userId') userId: string,
    @Query('weekStart') weekStart: string,
  ): Promise<{ success: boolean; data: MealSuggestion[] }> {
    const suggestions = await this.mealPlansService.suggestMeals(userId, weekStart);
    return { success: true, data: suggestions };
  }
}
