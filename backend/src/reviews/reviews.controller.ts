import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() body: any) {
    return this.reviewsService.create(body);
  }

  @Get()
  async findAll() {
    return this.reviewsService.findAll();
  }

  @Get('shoe/:shoeId')
  async findByShoe(@Param('shoeId') shoeId: string) {
    return this.reviewsService.findByShoe(Number(shoeId));
  }
}
