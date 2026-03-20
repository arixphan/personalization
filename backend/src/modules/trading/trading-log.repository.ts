import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TradingLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: number;
    content: string;
    date: Date;
    sentiment: string;
  }) {
    return (this.prisma as any).tradingLog.create({ data });
  }

  async findManyByMonth(userId: number, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return (this.prisma as any).tradingLog.findMany({
      where: {
        userId,
        date: { gte: start, lt: end },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findManyByWeek(userId: number, year: number, week: number) {
    // ISO week: week 1 starts on the first Thursday of the year
    const jan4 = new Date(year, 0, 4);
    const startOfWeek1 = new Date(jan4);
    startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
    const start = new Date(startOfWeek1);
    start.setDate(startOfWeek1.getDate() + (week - 1) * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    return (this.prisma as any).tradingLog.findMany({
      where: {
        userId,
        date: { gte: start, lt: end },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findByDate(userId: number, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return (this.prisma as any).tradingLog.findFirst({
      where: { userId, date: { gte: start, lte: end } },
    });
  }

  async findById(id: number) {
    return (this.prisma as any).tradingLog.findUnique({ where: { id } });
  }

  async update(id: number, data: { content?: string; sentiment?: string }) {
    return (this.prisma as any).tradingLog.update({ where: { id }, data });
  }

  async delete(id: number) {
    return (this.prisma as any).tradingLog.delete({ where: { id } });
  }
}
