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

enum CuisineType {
  RWANDAN = 'RWANDAN',
  EAST_AFRICAN = 'EAST_AFRICAN',
  AFRICAN = 'AFRICAN',
  INTERNATIONAL = 'INTERNATIONAL',
  FUSION = 'FUSION',
}

enum Complexity {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

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
