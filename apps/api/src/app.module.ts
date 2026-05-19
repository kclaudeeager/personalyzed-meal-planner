// =============================================================================
// App Module — Root module that imports all feature modules
// =============================================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { MealsModule } from './modules/meals/meals.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { HealthModule } from './modules/health/health.module';
import { MealPlansModule } from './modules/meal-plans/meal-plans.module';
import { ShoppingListsModule } from './modules/shopping-lists/shopping-lists.module';
import { ClerkController } from './modules/clerk/clerk.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '../../.env'),
    }),
    PrismaModule,
    UsersModule,
    MealsModule,
    RecommendationsModule,
    FeedbackModule,
    HealthModule,
    MealPlansModule,
    ShoppingListsModule,
  ],
  controllers: [ClerkController],
})
export class AppModule {}
