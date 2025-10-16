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

  async createReview(token: string, shoeId: number, rating: number, comment: string, pace?: number, weight?: number) {
    const userId = await this.getUserFromToken(token);

    // Ensure the shoe exists
    const shoe = await this.prisma.shoe.findUnique({ where: { id: shoeId } });
    if (!shoe) throw new NotFoundException('Shoe not found');

    return this.prisma.review.create({
      data: {
        rating,
        comment,
        shoeId,
        userId,
        pace,
        weight,
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
}
