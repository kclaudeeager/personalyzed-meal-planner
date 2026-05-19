// =============================================================================
// Feedback Service
// =============================================================================

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitFeedbackDto } from './feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(dto: SubmitFeedbackDto) {
    return this.prisma.feedback.create({
      data: {
        userId: dto.userId,
        mealId: dto.mealId,
        rating: dto.rating,
        feedbackType: dto.feedbackType as string as 'LIKED',
        comment: dto.comment,
      },
    });
  }

  async getUserFeedback(userId: string) {
    return this.prisma.feedback.findMany({
      where: { userId },
      include: { meal: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMealFeedback(mealId: string) {
    const feedback = await this.prisma.feedback.findMany({
      where: { mealId },
      include: { user: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating = feedback.length
      ? feedback.reduce((sum: number, f: { rating: number }) => sum + f.rating, 0) / feedback.length
      : 0;

    return {
      feedback,
      stats: {
        totalReviews: feedback.length,
        averageRating: Math.round(avgRating * 10) / 10,
      },
    };
  }
}
