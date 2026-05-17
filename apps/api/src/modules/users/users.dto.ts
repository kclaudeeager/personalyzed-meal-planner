// =============================================================================
// Users DTOs — Request validation
// =============================================================================

import { IsString, IsOptional, IsInt, IsEnum, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum AgeRange {
  UNDER_18 = 'UNDER_18',
  AGE_18_25 = 'AGE_18_25',
  AGE_26_35 = 'AGE_26_35',
  AGE_36_45 = 'AGE_36_45',
  AGE_46_55 = 'AGE_46_55',
  OVER_55 = 'OVER_55',
}

enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

enum BudgetLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHT = 'LIGHT',
  MODERATE = 'MODERATE',
  ACTIVE = 'ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
}

enum CookingSkill {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

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
