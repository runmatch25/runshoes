import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShoesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.shoe.create({ data });
  }

  async findAll() {
    return this.prisma.shoe.findMany({ include: { reviews: true } });
  }

  async findOne(id: number) {
    return this.prisma.shoe.findUnique({ where: { id } });
  }

  async getFilteredShoes(filters: any) {
    const { type, minRating, category, brand, stability, cushion } = filters;

    // Build where clause for shoe-level filters
    const whereClause: any = {
      ...(type && { type }),
      ...(brand && brand.length > 0 && { brand: { in: brand } }),
    };

    // Add review-based filters if specified
    // If multiple stability/cushion/category values, we want shoes that have reviews matching ANY of them
    const reviewFilters: any = {};
    if (stability && stability.length > 0) {
      reviewFilters.stability = { in: stability };
    }
    if (cushion && cushion.length > 0) {
      reviewFilters.cushion = { in: cushion };
    }
    // Category filtering is done via review categories array
    if (category && category.length > 0) {
      // We'll filter by categories in the reviews array after fetching
      // Prisma doesn't have a direct way to filter array contains with case-insensitive matching
    }

    if (Object.keys(reviewFilters).length > 0) {
      whereClause.reviews = {
        some: reviewFilters,
      };
    }

    const shoes = await this.prisma.shoe.findMany({
      where: whereClause,
      include: {
        reviews: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter by category from reviews (case-insensitive matching)
    let categoryFilteredShoes = shoes;
    if (category && category.length > 0) {
      categoryFilteredShoes = shoes.filter((shoe) => {
        // Check if any review has a category that matches (case-insensitive)
        return shoe.reviews.some((review) => {
          if (!review.categories || review.categories.length === 0) return false;
          return review.categories.some((reviewCat) =>
            category.some((filterCat) =>
              reviewCat.toLowerCase() === filterCat.toLowerCase()
            )
          );
        });
      });
    }

    // 🧮 Calculate average rating manually
    const filteredShoes = categoryFilteredShoes.filter((shoe) => {
      if (!minRating) return true;
      if (shoe.reviews.length === 0) return false;

      const avg =
        shoe.reviews.reduce((sum, r) => sum + r.rating, 0) /
        shoe.reviews.length;

      return avg >= minRating;
    });

    return filteredShoes;
  }
}
