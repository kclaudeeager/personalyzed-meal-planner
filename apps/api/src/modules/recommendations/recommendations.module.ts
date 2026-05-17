// =============================================================================
// Recommendations Module
// =============================================================================

import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { MealsModule } from '../meals/meals.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MealsModule, UsersModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
