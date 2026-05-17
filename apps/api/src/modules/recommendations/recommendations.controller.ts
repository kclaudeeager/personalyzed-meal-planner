// =============================================================================
// Recommendations Controller
// =============================================================================

import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@ApiBearerAuth()
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('daily/:userId')
  @ApiOperation({ summary: 'Get daily meal recommendations for a user' })
  async getDailyRecommendations(@Param('userId') userId: string) {
    const result = await this.recommendationsService.getDailyRecommendations(userId);
    return { success: true, data: result };
  }
}
