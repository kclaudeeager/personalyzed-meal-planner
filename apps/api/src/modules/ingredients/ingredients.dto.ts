import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocalAvailability } from '@meal-platform/types';

export class SearchIngredientDto {
  @ApiProperty({ example: 'tomato' })
  @IsString()
  q!: string;
}

export class CreateIngredientDto {
  @ApiProperty({ example: 'Tomato' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ enum: LocalAvailability, default: LocalAvailability.COMMON })
  @IsOptional()
  @IsEnum(LocalAvailability)
  localAvailability?: LocalAvailability;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  averageCost?: number;
}
