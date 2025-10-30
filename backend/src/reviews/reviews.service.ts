import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  async createReview(
    token: string,
    data: {
      shoeId: number;
      rating: number;
      comment: string;
      pace?: number;
      fit: 'SMALL' | 'TRUE_TO_SIZE' | 'BIG';
      cushion: 'SOFT' | 'BALANCED' | 'FIRM';
      stability: 'NEUTRAL' | 'MODERATE_SUPPORT' | 'HIGH_SUPPORT';
      mileage?: number;
      paceMinutes?: number;
      paceSeconds?: number;
      weight?: number;
    },
  ) {
    const userId = await this.getUserFromToken(token);

    // Ensure the shoe exists
    const shoe = await this.prisma.shoe.findUnique({ where: { id: data.shoeId } });
    if (!shoe) throw new NotFoundException('Shoe not found');

    return this.prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        shoeId: data.shoeId,
        userId,
        pace: data.pace,
        fit: data.fit as any,
        cushion: data.cushion as any,
        stability: data.stability as any,
        mileage: data.mileage,
        paceMinutes: data.paceMinutes,
        paceSeconds: data.paceSeconds,
        weight: data.weight,
      },
      include: { user: { select: { id: true, name: true } }, shoe: true },
    });
  }

  async getReviewsForShoe(shoeId: number) {
    return this.prisma.review.findMany({
      where: { shoeId },
      include: {
        user: { select: { id: true, name: true, pace: true, weight: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserReviews(token: string) {
    const userId = await this.getUserFromToken(token);
    return this.prisma.review.findMany({
      where: { userId },
      include: { shoe: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllReviews() {
    return this.prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true } },
        shoe: { select: { brand: true, model: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
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
    },
  ) {
    const userId = await this.getUserFromToken(token);

    const existing = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing) throw new NotFoundException('Review not found');
    if (existing.userId !== userId) throw new UnauthorizedException('Not allowed to edit this review');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { ...updates, createdAt: new Date() },
      include: { user: { select: { id: true, name: true } }, shoe: true },
    });
  }

  async deleteReview(token: string, reviewId: number) {
    const userId = await this.getUserFromToken(token);

    const existing = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing) throw new NotFoundException('Review not found');
    if (existing.userId !== userId) throw new UnauthorizedException('Not allowed to delete this review');

    await this.prisma.review.delete({ where: { id: reviewId } });
    return { success: true };
  }
}
