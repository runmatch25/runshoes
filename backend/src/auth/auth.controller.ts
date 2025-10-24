import { Body, Controller, Get, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("me")
  async getMe(@Headers("authorization") authHeader: string) {
    const token = authHeader?.replace("Bearer ", "");
    const user = await this.authService.getUserFromToken(token);
    return user;
  }

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; name: string; weight?: number; pace?: number },
  ) {
    return this.authService.register(body.email, body.password, body.name, body.weight, body.pace);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
