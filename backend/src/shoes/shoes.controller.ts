import { Controller, Get, Post, Body } from '@nestjs/common';
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
}
