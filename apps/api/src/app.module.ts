// =============================================================================
// App Module — Root module that imports all feature modules
// =============================================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { MealsModule } from './modules/meals/meals.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    UsersModule,
    MealsModule,
    RecommendationsModule,
    FeedbackModule,
    HealthModule,
  ],
})
export class AppModule {}
