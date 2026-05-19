// =============================================================================
// Meals DTOs
// =============================================================================

import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  IsEnum,
  IsArray,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CuisineType, Complexity } from '@meal-platform/types';

export class CreateMealDto {
  @ApiProperty({ example: 'Isombe with Ubugali' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Traditional Rwandan cassava leaves dish served with ubugali' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 45 })
  @IsInt()
  @Min(1)
  preparationTime!: number;

  @ApiProperty({ example: 3500 })
  @IsNumber()
  @Min(0)
  estimatedCost!: number;

  @ApiProperty({ example: 450 })
  @IsInt()
  @Min(0)
  calories!: number;

  @ApiPropertyOptional({ enum: CuisineType, default: CuisineType.RWANDAN })
  @IsOptional()
  @IsEnum(CuisineType)
  cuisineType?: CuisineType;

  @ApiPropertyOptional({ enum: Complexity, default: Complexity.MEDIUM })
  @IsOptional()
  @IsEnum(Complexity)
  complexity?: Complexity;

  @ApiPropertyOptional({ example: ['traditional', 'vegetarian', 'lunch'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class MealQueryDto {
  @ApiPropertyOptional({ enum: CuisineType })
  @IsOptional()
  @IsEnum(CuisineType)
  cuisineType?: CuisineType;

  @ApiPropertyOptional({ enum: Complexity })
  @IsOptional()
  @IsEnum(Complexity)
  complexity?: Complexity;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxPreparationTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}

export class GenerateShoppingListDto {
  @ApiProperty({ example: 'meal_plan_id_123' })
  @IsString()
  mealPlanId!: string;
}

export class ImportRecipeDto {
  @ApiProperty({ example: 'https://example.com/recipe' })
  @IsString()
  url!: string;
}

export class UpdateMealDto {
  @ApiPropertyOptional({ example: 'Isombe with Ubugali' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Traditional Rwandan cassava leaves dish served with ubugali' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsInt()
  @Min(1)
  preparationTime?: number;

  @ApiPropertyOptional({ example: 3500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  @ApiPropertyOptional({ example: 450 })
  @IsOptional()
  @IsInt()
  @Min(0)
  calories?: number;

  @ApiPropertyOptional({ enum: CuisineType })
  @IsOptional()
  @IsEnum(CuisineType)
  cuisineType?: CuisineType;

  @ApiPropertyOptional({ enum: Complexity })
  @IsOptional()
  @IsEnum(Complexity)
  complexity?: Complexity;

  @ApiPropertyOptional({ example: ['traditional', 'vegetarian', 'lunch'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class AddVideoDto {
  @ApiProperty({ example: 'https://www.youtube.com/watch?v=xxxx' })
  @IsString()
  url!: string;

  @ApiProperty({ example: 'YOUTUBE', enum: ['YOUTUBE', 'TIKTOK', 'ORIGINAL'] })
  @IsString()
  source!: string;

  @ApiProperty({ example: 'How to Make Rwandan Brochettes' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Rwandan Cooking' })
  @IsOptional()
  @IsString()
  creatorName?: string;
}

export class ImportRecipeResponseDto {
  success!: boolean;
  data!: Record<string, unknown>;
  message!: string;
}

export class ParseImageDto {
  @ApiProperty({ example: 'https://example.com/recipe-photo.jpg' })
  @IsString()
  imageUrl!: string;

  @ApiPropertyOptional({ example: 'My Homemade Dish' })
  @IsOptional()
  @IsString()
  title?: string;
}

export class ParseVideoDto {
  @ApiProperty({ example: 'https://www.youtube.com/watch?v=xxxx' })
  @IsString()
  videoUrl!: string;
}

export class TranslateRecipeDto {
  @ApiProperty({ example: 'Full recipe text to translate...' })
  @IsString()
  recipeText!: string;

  @ApiPropertyOptional({ example: 'Kinyarwanda', default: 'Kinyarwanda' })
  @IsOptional()
  @IsString()
  targetLanguage?: string;
}

export class AddImageUrlsDto {
  @ApiProperty({ example: ['https://example.com/meal-1.jpg', 'https://example.com/meal-2.jpg'] })
  @IsArray()
  @IsString({ each: true })
  urls!: string[];
}
