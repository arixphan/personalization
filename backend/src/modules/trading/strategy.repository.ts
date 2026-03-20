import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StrategyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: number;
    title: string;
    description: string;
    isActive: boolean;
    tags: string[];
    position: number;
  }) {
    return (this.prisma as any).strategy.create({ data });
  }

  async findMany(userId: number) {
    return (this.prisma as any).strategy.findMany({
      where: { userId },
      orderBy: { position: 'asc' },
    });
  }

  async findById(id: number) {
    return (this.prisma as any).strategy.findUnique({ where: { id } });
  }

  async update(id: number, data: any) {
    return (this.prisma as any).strategy.update({ where: { id }, data });
  }

  async delete(id: number) {
    return (this.prisma as any).strategy.delete({ where: { id } });
  }

  async count(userId: number) {
    return (this.prisma as any).strategy.count({ where: { userId } });
  }

  async updatePosition(id: number, position: number) {
    return (this.prisma as any).strategy.update({
      where: { id },
      data: { position },
    });
  }
}
