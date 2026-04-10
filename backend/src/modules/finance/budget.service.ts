import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto, UpdateBudgetDto, AllocationType, TransactionType } from '@personalization/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FINANCE_EVENT } from '../ai/events/finance.events';
import { TransactionService } from './transaction.service';

@Injectable()
export class BudgetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => TransactionService))
    private readonly transactionService: TransactionService,
  ) { }

  async create(dto: CreateBudgetDto, userId: number) {
    const { categories, ...rest } = dto;
    
    // Create budget first
    const budget = await this.prisma.monthlyBudget.create({
      data: {
        ...rest,
        userId,
      },
    });

    // Create categories
    for (const cat of categories) {
      const { id, parentId, ...data } = cat;
      await this.prisma.budgetCategory.create({
        data: {
          ...data,
          monthlyBudgetId: budget.id,
        },
      });
    }

    const fullBudget = await this.findOne(budget.id, userId);

    fullBudget.categories.forEach((cat) => {
      this.eventEmitter.emit(FINANCE_EVENT.BUDGET_UPDATED, {
        userId,
        budget: fullBudget,
        category: cat,
      });
    });

    return fullBudget;
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

  async applyCategory(id: number, userId: number) {
    const category = await this.prisma.budgetCategory.findFirst({
      where: { id, monthlyBudget: { userId } },
      include: { monthlyBudget: true },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.type === AllocationType.SUB_WALLET) {
      throw new BadRequestException('Sub-wallet category cannot be manually applied');
    }

    if (!category.targetWalletId) {
      throw new BadRequestException('Target wallet must be set for manual application');
    }

    // Create a transaction based on the allocation
    const transaction = await this.transactionService.create(
      {
        walletId: category.targetWalletId,
        amount: category.limitAmount,
        type: category.type === AllocationType.INCOME ? TransactionType.INCOME : TransactionType.EXPENSE,
        allocationId: category.id,
        note: `Applied allocation: ${category.name}`,
        date: new Date().toISOString(),
      },
      userId,
    );

    // Mark as processed if it's a one-time thing per month
    await this.prisma.budgetCategory.update({
      where: { id },
      data: {
        automationProcessed: true,
        lastRunAt: new Date(),
      },
    });

    return transaction;
  }
}
