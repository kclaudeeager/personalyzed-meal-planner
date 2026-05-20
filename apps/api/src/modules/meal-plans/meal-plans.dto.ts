import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMealPlanDto {
  @ApiProperty({ example: '2026-05-18T00:00:00.000Z' })
  @IsString()
  weekStart!: string;

  @ApiPropertyOptional({ example: 'My Weekly Plan' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class SuggestMealsDto {
  @ApiProperty({ example: '2026-05-18T00:00:00.000Z' })
  @IsString()
  weekStart!: string;
}

export class SetMealPlanEntryDto {
  @ApiProperty()
  @IsString()
  mealPlanId!: string;

  @ApiProperty()
  @IsString()
  mealId!: string;

  @ApiProperty({ example: 'BREAKFAST' })
  @IsString()
  mealType!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;
}
