import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // Extract user ID from token
  private async getUserFromToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: number };
      return decoded.userId;
    } catch {
      throw new UnauthorizedException('Invalid or missing token');
    }
  }

  private async getOptionalUserFromToken(token?: string) {
    if (!token) return undefined;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: number };
      return decoded.userId;
    } catch {
      return undefined;
    }
  }

  private mapReviewWithVotes<T extends { [key: string]: any; votes?: { value: number; userId: number }[] | null }>(
    review: T,
    currentUserId?: number,
  ): Omit<T, 'votes'> & {
    helpfulCount: number;
    notHelpfulCount: number;
    userVote: number;
  } {
    const votes = review.votes ?? [];
    const helpfulCount = votes.filter((vote) => vote.value === 1).length;
    const notHelpfulCount = votes.filter((vote) => vote.value === -1).length;
    const userVote =
      currentUserId !== undefined
        ? votes.find((vote) => vote.userId === currentUserId)?.value ?? 0
        : 0;

    const { votes: _votes, ...rest } = review;

    return {
      ...rest,
      helpfulCount,
      notHelpfulCount,
      userVote,
    };
  }

  async createReview(
    token: string,
    data: {
      shoeId: number;
      rating: number;
      comment: string;
      pace?: number;
      fit?: 'SMALL' | 'TRUE_TO_SIZE' | 'BIG';
      cushion?: 'SOFT' | 'BALANCED' | 'FIRM';
      stability?: 'NEUTRAL' | 'MODERATE_SUPPORT' | 'HIGH_SUPPORT';
      mileage?: number;
      paceMinutes?: number;
      paceSeconds?: number;
      weight?: number;
      paceRange?: string;
      weightRange?: string;
    },
  ) {
    const userId = await this.getUserFromToken(token);

    // Ensure the shoe exists
    const shoe = await this.prisma.shoe.findUnique({ where: { id: data.shoeId } });
    if (!shoe) throw new NotFoundException('Shoe not found');

    const review = await this.prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        shoeId: data.shoeId,
        userId,
        pace: data.pace,
        fit: data.fit ? (data.fit as any) : undefined,
        cushion: data.cushion ? (data.cushion as any) : undefined,
        stability: data.stability ? (data.stability as any) : undefined,
        mileage: data.mileage,
        paceMinutes: data.paceMinutes,
        paceSeconds: data.paceSeconds,
        weight: data.weight,
        paceRange: data.paceRange,
        weightRange: data.weightRange,
      },
      include: {
        user: { select: { id: true, name: true } },
        shoe: true,
        votes: { select: { value: true, userId: true } },
      },
    });

    return this.mapReviewWithVotes(review, userId);
  }

  async getReviewsForShoe(shoeId: number, token?: string) {
    const currentUserId = await this.getOptionalUserFromToken(token);

    const reviews = await this.prisma.review.findMany({
      where: { shoeId },
      include: {
        user: { select: { id: true, name: true, pace: true, weight: true } },
        votes: { select: { value: true, userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => this.mapReviewWithVotes(review, currentUserId));
  }

  async getUserReviews(token: string) {
    const userId = await this.getUserFromToken(token);
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      include: {
        shoe: true,
        votes: { select: { value: true, userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => this.mapReviewWithVotes(review, userId));
  }

  async getAllReviews() {
    const reviews = await this.prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true } },
        shoe: { select: { id: true, brand: true, model: true } },
        votes: { select: { value: true, userId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviews.map((review) => this.mapReviewWithVotes(review));
  }

  async updateReview(
    token: string,
    reviewId: number,
    updates: {
      rating?: number;
      comment?: string;
      pace?: number;
      fit?: 'SMALL' | 'TRUE_TO_SIZE' | 'BIG';
      cushion?: 'SOFT' | 'BALANCED' | 'FIRM';
      stability?: 'NEUTRAL' | 'MODERATE_SUPPORT' | 'HIGH_SUPPORT';
      mileage?: number;
      paceMinutes?: number;
      paceSeconds?: number;
      weight?: number;
      paceRange?: string;
      weightRange?: string;
    },
  ) {
    const userId = await this.getUserFromToken(token);

    const existing = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing) throw new NotFoundException('Review not found');
    if (existing.userId !== userId) throw new UnauthorizedException('Not allowed to edit this review');

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { ...updates, createdAt: new Date() },
      include: {
        user: { select: { id: true, name: true } },
        shoe: true,
        votes: { select: { value: true, userId: true } },
      },
    });

    return this.mapReviewWithVotes(updated, userId);
  }

  async deleteReview(token: string, reviewId: number) {
    const userId = await this.getUserFromToken(token);

    const existing = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing) throw new NotFoundException('Review not found');
    if (existing.userId !== userId) throw new UnauthorizedException('Not allowed to delete this review');

    await this.prisma.review.delete({ where: { id: reviewId } });
    return { success: true };
  }

  async voteReview(token: string, reviewId: number, value: number) {
    const userId = await this.getUserFromToken(token);
    if (value !== 1 && value !== -1) {
      throw new BadRequestException('Vote value must be 1 or -1');
    }

    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.userId === userId) {
      throw new ForbiddenException('You cannot vote on your own review');
    }

    const existingVote = await this.prisma.reviewVote.findUnique({
      where: { reviewId_userId: { reviewId, userId } },
    });

    if (existingVote && existingVote.value === value) {
      await this.prisma.reviewVote.delete({
        where: { id: existingVote.id },
      });
    } else if (existingVote) {
      await this.prisma.reviewVote.update({
        where: { id: existingVote.id },
        data: { value },
      });
    } else {
      await this.prisma.reviewVote.create({
        data: {
          reviewId,
          userId,
          value,
        },
      });
    }

    const updatedReview = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: { select: { id: true, name: true, pace: true, weight: true } },
        votes: { select: { value: true, userId: true } },
      },
    });

    if (!updatedReview) {
      throw new NotFoundException('Review not found');
    }

    return this.mapReviewWithVotes(updatedReview, userId);
  }
}
