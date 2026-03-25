import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoanType, TransactionType } from '@personalization/shared';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getNetWorth(userId: number) {
    const wallets = await this.prisma.wallet.findMany({ where: { userId } });
    const assets = await this.prisma.asset.findMany({ where: { userId } });
    const loans = await this.prisma.loan.findMany({ where: { userId } });

    const totalCash = wallets.reduce((sum, w) => sum + w.balance, 0);
    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
    const totalReceivables = loans
      .filter((l) => l.type === LoanType.RECEIVABLE)
      .reduce((sum, l) => sum + l.remaining, 0);
    const totalPayables = loans
      .filter((l) => l.type === LoanType.PAYABLE)
      .reduce((sum, l) => sum + l.remaining, 0);

    return {
      totalCash,
      totalAssets,
      totalReceivables,
      totalPayables,
      netWorth: totalCash + totalAssets,
    };
  }

  async getCashFlow(userId: number, year: number) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        wallet: { userId },
        date: {
          gte: startOfYear,
          lt: endOfYear,
        },
      },
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    transactions.forEach((t) => {
      const m = new Date(t.date).getMonth();
      if (t.type === TransactionType.INCOME) {
        monthlyData[m].income += t.amount;
      } else if (t.type === TransactionType.EXPENSE) {
        monthlyData[m].expense += t.amount;
      }
    });

    return monthlyData;
  }
}
