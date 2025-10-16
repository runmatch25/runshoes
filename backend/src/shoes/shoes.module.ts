import { Module } from '@nestjs/common';
import { ShoesController } from './shoes.controller';
import { ShoesService } from './shoes.service';
import { ReviewsService } from '../reviews/reviews.service';

@Module({
  controllers: [ShoesController],
  providers: [ShoesService, ReviewsService]
})
export class ShoesModule {}
