import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { SearchIngredientDto, CreateIngredientDto } from './ingredients.dto';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search ingredients by name (autocomplete)' })
  async search(@Query() dto: SearchIngredientDto) {
    const ingredients = await this.ingredientsService.search(dto.q);
    return { success: true, data: ingredients };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ingredient' })
  async create(@Body() dto: CreateIngredientDto) {
    const ingredient = await this.ingredientsService.create(dto);
    return { success: true, data: ingredient };
  }
}
