import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from './transaction.service';

@Injectable()
export class FinanceCronService {
  private readonly logger = new Logger(FinanceCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) { }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAutomation() {
    this.logger.log('Running finance automation check...');
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    await this.processCategoryAutomation(day, month, year);
  }

  private async processCategoryAutomation(
    day: number,
    month: number,
    year: number,
  ) {
    const categoriesToProcess = await this.prisma.budgetCategory.findMany({
      where: {
        isAutomationEnabled: true,
        automationDay: day,
        automationProcessed: false,
        targetWalletId: { not: null },
        limitAmount: { gt: 0 },
        monthlyBudget: {
          month,
          year,
        },
      },
      include: {
        monthlyBudget: true,
      },
    });

    for (const category of categoriesToProcess) {
      try {
        await this.transactionService.create(
          {
            walletId: category.targetWalletId!,
            amount: category.limitAmount,
            type: category.type as any,
            category: category.name,
            note: `Automated bucket ${category.type.toLowerCase()}: ${category.name}`,
            date: new Date().toISOString(),
          },
          category.monthlyBudget.userId,
        );

        await this.prisma.budgetCategory.update({
          where: { id: category.id },
          data: {
            automationProcessed: true,
            lastRunAt: new Date(),
          },
        });

        this.logger.log(
          `Processed automation for category ID: ${category.id} (${category.name})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to process automation for category ${category.id}: ${error.message}`,
        );
      }
    }
  }
}
