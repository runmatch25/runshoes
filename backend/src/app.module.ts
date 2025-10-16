import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ShoesModule } from './shoes/shoes.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, UsersModule, ShoesModule, ReviewsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
