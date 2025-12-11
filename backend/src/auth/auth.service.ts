import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(email: string, password: string, name?: string, weight?: number, pace?: number) {
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
      user: { id: user.id, name: user.name, email: user.email, weight: user.weight, pace: user.pace, paceRange: user.paceRange, weightRange: user.weightRange, nickname: user.nickname, useNickname: user.useNickname, onboardingCompleted: user.onboardingCompleted },
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
      user: { id: user.id, name: user.name, email: user.email, weight: user.weight, pace: user.pace, paceRange: user.paceRange, weightRange: user.weightRange, nickname: user.nickname, useNickname: user.useNickname, onboardingCompleted: user.onboardingCompleted },
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
    select: { id: true, name: true, email: true, weight: true, pace: true, paceRange: true, weightRange: true, nickname: true, useNickname: true, experience: true, pronation: true, createdAt: true, onboardingCompleted: true },
  });
  return user;
}

  async updateUserProfile(token: string, data: { name?: string; paceRange?: string; weightRange?: string; nickname?: string; useNickname?: boolean; experience?: string; pronation?: string; onboardingCompleted?: boolean }) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: number };
    const user = await this.prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        paceRange: data.paceRange !== undefined ? data.paceRange : undefined,
        weightRange: data.weightRange !== undefined ? data.weightRange : undefined,
        nickname: data.nickname !== undefined ? data.nickname : undefined,
        useNickname: data.useNickname !== undefined ? data.useNickname : undefined,
        experience: data.experience !== undefined ? data.experience : undefined,
        pronation: data.pronation !== undefined ? data.pronation : undefined,
        onboardingCompleted: data.onboardingCompleted !== undefined ? data.onboardingCompleted : undefined,
      },
      select: { id: true, name: true, email: true, weight: true, pace: true, paceRange: true, weightRange: true, nickname: true, useNickname: true, experience: true, pronation: true, createdAt: true, onboardingCompleted: true },
    });
    return user;
  }

  async oauthLogin(email: string, name: string) {
    // Find or create user for OAuth login
    let user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Create new user with a random password (they'll never use it)
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      const hashed = await bcrypt.hash(randomPassword, 10);
      
      user = await this.prisma.user.create({
        data: {
          email,
          password: hashed,
          name,
        },
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, weight: user.weight, pace: user.pace, paceRange: user.paceRange, weightRange: user.weightRange, nickname: user.nickname, useNickname: user.useNickname, onboardingCompleted: user.onboardingCompleted },
    };
  }

}
