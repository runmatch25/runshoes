import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { ReviewsService } from '../reviews/reviews.service';
import { ShoesService } from './shoes.service';

@Controller('shoes')
export class ShoesController {
  constructor(
    private readonly shoesService: ShoesService,
    private readonly reviewsService: ReviewsService
  ) {}

  // 🟩 Create a new shoe
  @Post()
  async createShoe(@Body() data: any) {
    return this.shoesService.create({
      brand: data.brand,
      model: data.model,
      type: data.type,
    });
  }

  // 🟦 Get all shoes, with optional filters
  @Get()
  async getFilteredShoes(
    @Query('type') type?: string,
    @Query('minRating') minRating?: number,
  ) {
    // If no filters are passed, return all shoes
    if (!type && !minRating) {
      return this.shoesService.findAll();
    }

    return this.shoesService.getFilteredShoes({
      type,
      minRating: minRating ? Number(minRating) : undefined,
    });
  }

  // 🟨 Get one shoe by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.shoesService.findOne(Number(id));
  }

  // 🟧 Get reviews for a specific shoe
  @Get(':shoeId/reviews')
  async getReviewsForShoe(@Param('shoeId') shoeId: string, @Headers('authorization') authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '') ?? '';
    return this.reviewsService.getReviewsForShoe(Number(shoeId), token);
  }
}
