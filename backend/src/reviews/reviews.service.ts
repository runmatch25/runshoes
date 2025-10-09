import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.review.create({ data });
  }

  async findAll() {
    return this.prisma.review.findMany({
      include: { user: true, shoe: true },
    });
  }

  async findByShoe(shoeId: number) {
    return this.prisma.review.findMany({
      where: { shoeId },
      include: { user: true },
    });
  }
}
