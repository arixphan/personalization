import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';

@Injectable()
export class MemoryService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMemory(
    userId: number,
    key: string,
    value: string,
    source = 'ai_chat',
  ) {
    return this.prisma.userMemory.upsert({
      where: {
        userId_key: { userId, key },
      },
      update: {
        value,
        source,
        updatedAt: new Date(),
      },
      create: {
        userId,
        key,
        value,
        source,
      },
    });
  }

  async getRecentMemories(userId: number, limit = 20) {
    return this.prisma.userMemory.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  async clearMemories(userId: number) {
    return this.prisma.userMemory.deleteMany({
      where: { userId },
    });
  }
}
