import { Body, Controller, Get, Headers, Param, Post, Patch, Delete } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // Get all reviews (for /reviews)
  @Get()
  async getAll() {
    return this.reviewsService.getAllReviews();
  }

  @Post()
  async create(
    @Headers('authorization') authHeader: string,
    @Body()
    body: {
      shoeId: number;
      rating: number;
      comment: string;
      // legacy
      pace?: number;
      // new structured fields
      fit?: 'SMALL' | 'TRUE_TO_SIZE' | 'BIG';
      cushion?: 'SOFT' | 'BALANCED' | 'FIRM';
      stability?: 'NEUTRAL' | 'MODERATE_SUPPORT' | 'HIGH_SUPPORT';
      mileage?: number;
      paceMinutes?: number;
      paceSeconds?: number;
      weight?: number;
    },
  ) {
    const token = authHeader?.replace('Bearer ', '');
    return this.reviewsService.createReview(
      token,
      {
        shoeId: body.shoeId,
        rating: body.rating,
        comment: body.comment,
        pace: body.pace,
        fit: body.fit,
        cushion: body.cushion,
        stability: body.stability,
        mileage: body.mileage,
        paceMinutes: body.paceMinutes,
        paceSeconds: body.paceSeconds,
        weight: body.weight,
      },
    );
  }

  @Get('shoe/:shoeId')
  async getByShoe(@Param('shoeId') shoeId: string) {
    return this.reviewsService.getReviewsForShoe(Number(shoeId));
  }

  @Get('me')
  async getMyReviews(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.reviewsService.getUserReviews(token);
  }

  @Patch(':id')
  async updateReview(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
    @Body()
    body: {
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
    const token = authHeader?.replace('Bearer ', '');
    return this.reviewsService.updateReview(token, Number(id), body);
  }

  @Delete(':id')
  async deleteReview(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.reviewsService.deleteReview(token, Number(id));
  }
}
