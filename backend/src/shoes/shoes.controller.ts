import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ReviewsService } from '../reviews/reviews.service';
import { ShoesService } from './shoes.service';

@Controller('shoes')
export class ShoesController {
  constructor(
    private readonly shoesService: ShoesService,
    private readonly reviewsService: ReviewsService
  ) {}
  // Get reviews for a shoe (for /shoes/:shoeId/reviews)
  @Get(':shoeId/reviews')
  async getReviewsForShoe(@Param('shoeId') shoeId: string) {
    return this.reviewsService.getReviewsForShoe(Number(shoeId));
  }

  @Post()
  async create(@Body() body: any) {
    return this.shoesService.create(body);
  }

  @Get()
  async findAll() {
    return this.shoesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.shoesService.findOne(Number(id));
  }

  @Post()
  async createShoe(@Body() data: any) {
    return this.shoesService.create({
      data: {
        brand: data.brand,
        model: data.model,
        type: data.type,
      },
    });
  }
}
