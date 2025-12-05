import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(email: string, password: string, name: string, weight?: number, pace?: number) {
    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        weight,
        pace,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, weight: user.weight, pace: user.pace, paceRange: user.paceRange, weightRange: user.weightRange },
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, weight: user.weight, pace: user.pace, paceRange: user.paceRange, weightRange: user.weightRange },
    };
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: number };
      return this.prisma.user.findUnique({ where: { id: decoded.userId } });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserFromToken(token: string) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: number };
  const user = await this.prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, name: true, email: true, weight: true, pace: true, paceRange: true, weightRange: true },
  });
  return user;
}

  async updateUserProfile(token: string, data: { paceRange?: string; weightRange?: string }) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: number };
    const user = await this.prisma.user.update({
      where: { id: decoded.userId },
      data: {
        paceRange: data.paceRange !== undefined ? data.paceRange : undefined,
        weightRange: data.weightRange !== undefined ? data.weightRange : undefined,
      },
      select: { id: true, name: true, email: true, weight: true, pace: true, paceRange: true, weightRange: true },
    });
    return user;
  }

}
