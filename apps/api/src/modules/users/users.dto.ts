// =============================================================================
// Users DTOs — Request validation
// =============================================================================

import { IsString, IsOptional, IsInt, IsEnum, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AgeRange,
  Gender,
  BudgetLevel,
  ActivityLevel,
  CookingSkill,
} from '@meal-platform/types';

export class CreateUserDto {
  @ApiProperty({ example: 'clerk_abc123' })
  @IsString()
  clerkId!: string;

  @ApiProperty({ example: 'jean@example.rw' })
  @IsString()
  email!: string;

  @ApiProperty({ example: 'Jean Mugabo' })
  @IsString()
  fullName!: string;
}

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: AgeRange })
  @IsOptional()
  @IsEnum(AgeRange)
  ageRange?: AgeRange;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  householdSize?: number;

  @ApiPropertyOptional({ enum: BudgetLevel })
  @IsOptional()
  @IsEnum(BudgetLevel)
  budgetLevel?: BudgetLevel;

  @ApiPropertyOptional({ enum: ActivityLevel })
  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @ApiPropertyOptional({ enum: CookingSkill })
  @IsOptional()
  @IsEnum(CookingSkill)
  cookingSkill?: CookingSkill;

  @ApiPropertyOptional({ example: ['vegetarian', 'low-carb'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryPreferences?: string[];

  @ApiPropertyOptional({ example: ['peanuts', 'shellfish'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];
}
