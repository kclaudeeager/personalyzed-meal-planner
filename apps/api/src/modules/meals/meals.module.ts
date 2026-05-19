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

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [MealsController],
  providers: [MealsService, OpenAiRecipeParserService, AuthGuard],
  exports: [MealsService, OpenAiRecipeParserService],
})
export class MealsModule {}
