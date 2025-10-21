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
  const { type, minRating } = filters;

  const shoes = await this.prisma.shoe.findMany({
    where: {
      ...(type && { type }),
    },
    include: {
      reviews: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // 🧮 Calculate average rating manually
  const filteredShoes = shoes.filter((shoe) => {
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
