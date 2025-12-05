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
    @Query('category') category?: string | string[],
    @Query('brand') brand?: string | string[],
    @Query('stability') stability?: string | string[],
    @Query('cushion') cushion?: string | string[],
  ) {
    // Normalize to arrays
    const categories = Array.isArray(category) ? category : category ? [category] : [];
    const brands = Array.isArray(brand) ? brand : brand ? [brand] : [];
    const stabilities = Array.isArray(stability) ? stability : stability ? [stability] : [];
    const cushions = Array.isArray(cushion) ? cushion : cushion ? [cushion] : [];

    // If no filters are passed, return all shoes
    if (!type && !minRating && categories.length === 0 && brands.length === 0 && stabilities.length === 0 && cushions.length === 0) {
      return this.shoesService.findAll();
    }

    return this.shoesService.getFilteredShoes({
      type,
      minRating: minRating ? Number(minRating) : undefined,
      category: categories,
      brand: brands,
      stability: stabilities as ('NEUTRAL' | 'MODERATE_SUPPORT' | 'HIGH_SUPPORT')[],
      cushion: cushions as ('SOFT' | 'BALANCED' | 'FIRM')[],
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
