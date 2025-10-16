import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  async create(
    @Headers('authorization') authHeader: string,
    @Body() body: { shoeId: number; rating: number; comment: string; pace?: number; weight?: number },
  ) {
    const token = authHeader?.replace('Bearer ', '');
    return this.reviewsService.createReview(token, body.shoeId, body.rating, body.comment, body.pace, body.weight);
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
}
