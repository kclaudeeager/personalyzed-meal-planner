// =============================================================================
// Feedback DTOs
// =============================================================================

import { IsString, IsInt, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackType } from '@meal-platform/types';

export class SubmitFeedbackDto {
  @ApiProperty({ example: 'user_cuid_123' })
  @IsString()
  userId!: string;

  @ApiProperty({ example: 'meal_cuid_456' })
  @IsString()
  mealId!: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ enum: FeedbackType })
  @IsEnum(FeedbackType)
  feedbackType!: FeedbackType;

  @ApiPropertyOptional({ example: 'Loved the isombe, very authentic taste!' })
  @IsOptional()
  @IsString()
  comment?: string;
}
