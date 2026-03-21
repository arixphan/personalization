import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto, UpdateBudgetDto } from '@personalization/shared';

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBudgetDto, userId: number) {
    const { categories, ...rest } = dto;
    return this.prisma.monthlyBudget.create({
      data: {
        ...rest,
        userId,
        categories: {
          create: categories.map(({ id, monthlyBudgetId, ...cat }: any) => cat),
        },
      },
      include: {
        categories: true,
      },
    });
  }

  async findByMonth(userId: number, month: number, year: number) {
    return this.prisma.monthlyBudget.findUnique({
      where: {
        userId_month_year: { userId, month, year },
      },
      include: {
        categories: true,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.monthlyBudget.findMany({
      where: { userId },
      include: {
        categories: true,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async findOne(id: number, userId: number) {
    const budget = await this.prisma.monthlyBudget.findFirst({
      where: { id, userId },
      include: {
        categories: true,
      },
    });
    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }
    return budget;
  }

  async update(id: number, dto: UpdateBudgetDto, userId: number) {
    await this.findOne(id, userId);
    const { categories, ...rest } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (categories) {
        await tx.budgetCategory.deleteMany({
          where: { monthlyBudgetId: id },
        });
      }

      return tx.monthlyBudget.update({
        where: { id },
        data: {
          ...rest,
          categories: categories
            ? {
                create: categories.map(({ id, monthlyBudgetId, ...cat }: any) => cat),
              }
            : undefined,
        },
        include: {
          categories: true,
        },
      });
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.monthlyBudget.delete({
      where: { id },
    });
  }
}
