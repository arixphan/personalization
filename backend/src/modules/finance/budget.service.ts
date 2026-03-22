import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto, UpdateBudgetDto } from '@personalization/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FINANCE_EVENT } from '../ai/events/finance.events';

@Injectable()
export class BudgetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateBudgetDto, userId: number) {
    const { categories, ...rest } = dto;
    const budget = await this.prisma.monthlyBudget.create({
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

    budget.categories.forEach((cat) => {
      this.eventEmitter.emit(FINANCE_EVENT.BUDGET_UPDATED, {
        userId,
        budget,
        category: cat,
      });
    });

    return budget;
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
    const oldBudget = await this.findOne(id, userId);
    const { categories, ...rest } = dto;

    const updated = await this.prisma.$transaction(async (tx) => {
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
                create: categories.map(
                  ({ id, monthlyBudgetId, ...cat }: any) => cat,
                ),
              }
            : undefined,
        },
        include: {
          categories: true,
        },
      });
    });

    if (categories) {
      oldBudget.categories.forEach((cat) =>
        this.eventEmitter.emit(FINANCE_EVENT.TRANSACTION_DELETED, {
          entityId: cat.id,
        }),
      );
    }
    updated.categories.forEach((cat) =>
      this.eventEmitter.emit(FINANCE_EVENT.BUDGET_UPDATED, {
        userId,
        budget: updated,
        category: cat,
      }),
    );

    return updated;
  }

  async remove(id: number, userId: number) {
    const budget = await this.findOne(id, userId);
    const deleted = await this.prisma.monthlyBudget.delete({
      where: { id },
    });

    budget.categories.forEach((cat) => {
      this.eventEmitter.emit(FINANCE_EVENT.TRANSACTION_DELETED, {
        entityId: cat.id,
      });
    });

    return deleted;
  }
}
