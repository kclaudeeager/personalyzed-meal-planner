import { Controller, Get, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto, SetMealPlanEntryDto } from './meal-plans.dto';

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
    @Body('weekStart') weekStart: string,
  ) {
    const plan = await this.mealPlansService.generateFromRecommendations(userId, weekStart);
    return { success: true, data: plan };
  }
}
