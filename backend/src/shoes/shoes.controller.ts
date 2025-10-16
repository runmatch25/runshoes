import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ShoesService } from './shoes.service';

@Controller('shoes')
export class ShoesController {
  constructor(private readonly shoesService: ShoesService) {}

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
