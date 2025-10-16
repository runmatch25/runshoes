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
}
