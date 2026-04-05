import { z } from 'zod';
import { PrismaService } from '../../prisma';
import { AiTool, AiToolResult } from '../types/tool.types';

export class GetWalletSummaryTool implements AiTool {
  name = 'get_wallet_summary';
  description =
    'Returns a summary of all user wallets and their current balances.';
  inputSchema = z.object({});
  requiresConfirmation = false;

  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number): Promise<AiToolResult> {
    const wallets = await this.prisma.wallet.findMany({ where: { userId } });
    return {
      success: true,
      data: wallets.map((w) => ({
        name: w.name,
        balance: w.balance,
        currency: w.currency,
      })),
    };
  }
}

export class GetFinanceSummaryTool implements AiTool {
  name = 'get_finance_summary';
  description = 'Returns a high-level summary of assets, loans, and net worth.';
  inputSchema = z.object({});
  requiresConfirmation = false;

  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number): Promise<AiToolResult> {
    const [wallets, assets, loans] = await Promise.all([
      this.prisma.wallet.findMany({ where: { userId } }),
      this.prisma.asset.findMany({ where: { userId } }),
      this.prisma.loan.findMany({ where: { userId } }),
    ]);

    const totalWalletBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
    const totalAssetValue = assets.reduce((acc, a) => acc + a.value, 0);

    const payableLoans = loans
      .filter((l) => l.type === 'PAYABLE')
      .reduce((acc, l) => acc + l.remaining, 0);
    const receivableLoans = loans
      .filter((l) => l.type === 'RECEIVABLE')
      .reduce((acc, l) => acc + l.remaining, 0);

    return {
      success: true,
      data: {
        totalWalletBalance,
        totalAssetValue,
        payableLoans,
        receivableLoans,
        netWorth:
          totalWalletBalance + totalAssetValue + receivableLoans - payableLoans,
      },
    };
  }
}

export class SearchFinanceHistoryTool implements AiTool {
  name = 'search_finance_history';
  description =
    'Searches through the user financial history (transactions, budgets, etc.) using natural language. Use this when the user asks about past spending, specific transactions, or historical trends.';
  inputSchema = z.object({
    query: z.string().describe('The natural language query to search for'),
  });
  requiresConfirmation = false;

  constructor(private readonly rag: any) {}

  async execute(
    userId: number,
    input: { query: string },
  ): Promise<AiToolResult> {
    const queryEmbedding = await this.rag.embedText(input.query, userId);
    const context = await this.rag.retrieveContext(
      userId,
      queryEmbedding,
      'finance',
      20,
    );

    if (!context || context.length === 0) {
      return {
        success: true,
        data: 'No matching financial history found for this query.',
      };
    }

    return {
      success: true,
      data: context.join('\n---\n'),
    };
  }
}

export class GetTransactionsTool implements AiTool {
  name = 'get_transactions';
  description =
    'Fetches a list of financial transactions with precise filtering (date range, type, wallet). Use this for detailed history or when the user asks for specific transactions.';
  inputSchema = z.object({
    startDate: z.string().optional().describe('Filter by start date (ISO string)'),
    endDate: z.string().optional().describe('Filter by end date (ISO string)'),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
    walletId: z.number().optional(),
    limit: z.number().optional().default(50),
  });
  requiresConfirmation = false;

  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: number,
    input: {
      startDate?: string;
      endDate?: string;
      type?: any;
      walletId?: number;
      limit?: number;
    },
  ): Promise<AiToolResult> {
    const { startDate, endDate, type, walletId, limit } = input;

    const where: any = {
      wallet: { userId },
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (type) where.type = type;
    if (walletId) where.walletId = walletId;

    const transactions = await this.prisma.transaction.findMany({
      where,
      take: limit,
      orderBy: { date: 'desc' },
      include: { wallet: true },
    });

    return {
      success: true,
      data: transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
        wallet: t.wallet.name,
        note: t.note,
      })),
    };
  }
}

export class GetSpendingStatsTool implements AiTool {
  name = 'get_spending_stats';
  description =
    'Calculates total spending and income for a period. Use this for questions like "How much did I spend this month?" or "What is my total income since last week?"';
  inputSchema = z.object({
    startDate: z.string().describe('Start date for statistics (ISO string)'),
    endDate: z.string().describe('End date for statistics (ISO string)'),
  });
  requiresConfirmation = false;

  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: number,
    input: { startDate: string; endDate: string },
  ): Promise<AiToolResult> {
    const { startDate, endDate } = input;

    const transactions = await this.prisma.transaction.findMany({
      where: {
        wallet: { userId },
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);

    const categories: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const cat = t.category || 'Uncategorized';
        categories[cat] = (categories[cat] || 0) + t.amount;
      });

    return {
      success: true,
      data: {
        period: { startDate, endDate },
        totalIncome: income,
        totalExpense: expense,
        netChange: income - expense,
        byCategory: categories,
      },
    };
  }
}

export class CreateTransactionTool implements AiTool {
  name = 'create_transaction';
  description = 'Creates a new financial transaction (income, expense, or transfer).';
  inputSchema = z.object({
    amount: z.number().describe('The transaction amount'),
    type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).describe('The type of transaction'),
    walletId: z.number().describe('The ID of the source wallet'),
    toWalletId: z.number().optional().describe('The ID of the target wallet (required for TRANSFER)'),
    category: z.string().optional().describe('The budget category (e.g., "Food", "Salary")'),
    date: z.string().optional().describe('ISO-8601 date string. Defaults to now.'),
    note: z.string().optional().describe('Optional description or note'),
  });
  requiresConfirmation = true;

  constructor(private readonly transactionService: any) {}

  async execute(
    userId: number,
    input: any,
  ): Promise<AiToolResult> {
    try {
      const transaction = await this.transactionService.create(input, userId);
      return {
        success: true,
        data: { id: transaction.id, amount: transaction.amount, type: transaction.type },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export class DeleteTransactionTool implements AiTool {
  name = 'delete_transaction';
  description = 'Deletes a financial transaction and reverses its balance impact.';
  inputSchema = z.object({
    id: z.number().describe('The ID of the transaction to delete'),
  });
  requiresConfirmation = true;

  constructor(private readonly transactionService: any) {}

  async execute(
    userId: number,
    input: { id: number },
  ): Promise<AiToolResult> {
    try {
      await this.transactionService.remove(input.id, userId);
      return {
        success: true,
        data: { message: `Transaction ${input.id} deleted successfully` },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
