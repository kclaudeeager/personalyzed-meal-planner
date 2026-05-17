// =============================================================================
// Feedback Controller
// =============================================================================

import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { SubmitFeedbackDto } from './feedback.dto';

@ApiTags('feedback')
@ApiBearerAuth()
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit meal feedback' })
  async submit(@Body() dto: SubmitFeedbackDto) {
    const feedback = await this.feedbackService.submit(dto);
    return { success: true, data: feedback };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all feedback from a user' })
  async getUserFeedback(@Param('userId') userId: string) {
    const feedback = await this.feedbackService.getUserFeedback(userId);
    return { success: true, data: feedback };
  }

  @Get('meal/:mealId')
  @ApiOperation({ summary: 'Get feedback and stats for a meal' })
  async getMealFeedback(@Param('mealId') mealId: string) {
    const result = await this.feedbackService.getMealFeedback(mealId);
    return { success: true, data: result };
  }
}
