// =============================================================================
// Meals Module
// =============================================================================

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';
import { OpenAiRecipeParserService } from './openai-recipe-parser.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { IngredientsModule } from '../ingredients/ingredients.module';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
    IngredientsModule,
  ],
  controllers: [MealsController],
  providers: [MealsService, OpenAiRecipeParserService, AuthGuard],
  exports: [MealsService, OpenAiRecipeParserService],
})
export class MealsModule {}
