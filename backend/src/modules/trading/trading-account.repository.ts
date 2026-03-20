import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TradingAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number) {
    return (this.prisma as any).tradingAccount.findUnique({
      where: { userId },
    });
  }

  async upsert(userId: number, data: { provider: string; apiKey?: string | null; apiSecret?: string | null; isActive: boolean }) {
    return (this.prisma as any).tradingAccount.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }

  async delete(userId: number) {
    return (this.prisma as any).tradingAccount.delete({
      where: { userId },
    });
  }
}
