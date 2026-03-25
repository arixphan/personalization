import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, TransactionType } from '@personalization/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FINANCE_EVENT } from '../ai/events/finance.events';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async create(dto: CreateTransactionDto, userId: number, externalTx?: Prisma.TransactionClient) {
    const logic = async (tx: Prisma.TransactionClient) => {
      // 1. Create the transaction record
      const transaction = await tx.transaction.create({
        data: {
          ...dto,
          date: dto.date ? new Date(dto.date) : new Date(),
        },
        include: { wallet: true, toWallet: true },
      });

      // 2. Adjust wallet balance based on transaction type and budget category rules
      let shouldAffectBalance = true;

      if (dto.type === TransactionType.EXPENSE && dto.category) {
        // Find the budget category for the current month/year to check affectsBalance
        const date = dto.date ? new Date(dto.date) : new Date();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const budgetCategory = await tx.budgetCategory.findFirst({
          where: {
            name: dto.category,
            monthlyBudget: {
              userId,
              month,
              year,
            },
          },
        });

        if (budgetCategory && budgetCategory.affectsBalance === false) {
          shouldAffectBalance = false;
        }

        // Update spentAmount in the budget category regardless of wallet impact
        if (budgetCategory) {
          await tx.budgetCategory.update({
            where: { id: budgetCategory.id },
            data: { spentAmount: { increment: dto.amount } },
          });
        }
      }

      if (shouldAffectBalance) {
        if (
          dto.type === TransactionType.EXPENSE ||
          dto.type === TransactionType.TRANSFER
        ) {
          // 1. Fetch current wallet balance
          const wallet = await tx.wallet.findUnique({
            where: { id: dto.walletId },
            select: { balance: true },
          });

          if (!wallet) throw new NotFoundException('Wallet not found');

          // 2. Check sufficient funds
          if (wallet.balance < dto.amount) {
            throw new BadRequestException(
              'Insufficient funds in source wallet',
            );
          }

          // 3. Perform balance updates
          if (dto.type === TransactionType.EXPENSE) {
            await tx.wallet.update({
              where: { id: dto.walletId },
              data: { balance: { decrement: dto.amount } },
            });
          } else if (dto.type === TransactionType.TRANSFER && dto.toWalletId) {
            // Decrement from source wallet
            await tx.wallet.update({
              where: { id: dto.walletId },
              data: { balance: { decrement: dto.amount } },
            });
            // Increment to target wallet
            await tx.wallet.update({
              where: { id: dto.toWalletId },
              data: { balance: { increment: dto.amount } },
            });
          }
        } else if (dto.type === TransactionType.INCOME) {
          await tx.wallet.update({
            where: { id: dto.walletId },
            data: { balance: { increment: dto.amount } },
          });
        }
      }

      // 3. Handle Loan Integration
      if (dto.loanId) {
        const loan = await tx.loan.findUnique({
          where: { id: dto.loanId },
        });

        if (loan) {
          const isIncomeOnReceivable =
            dto.type === TransactionType.INCOME && loan.type === 'RECEIVABLE';
          const isExpenseOnPayable =
            dto.type === TransactionType.EXPENSE && loan.type === 'PAYABLE';

          if (isIncomeOnReceivable || isExpenseOnPayable) {
            const newRemaining = Math.max(0, loan.remaining - dto.amount);
            await tx.loan.update({
              where: { id: dto.loanId },
              data: {
                remaining: newRemaining,
                status: newRemaining === 0 ? 'PAID_OFF' : loan.status
              },
            });
          }
        }
      }

      return transaction;
    };

    const transaction = externalTx
      ? await logic(externalTx)
      : await this.prisma.$transaction(logic);

    // Background AI Sync
    this.eventEmitter.emit(FINANCE_EVENT.TRANSACTION_CREATED, {
      userId,
      transaction,
    });

    return transaction;
  }


  async findAll(userId: number, walletId?: number) {
    return this.prisma.transaction.findMany({
      where: {
        wallet: { userId },
        walletId: walletId || undefined,
      },
      orderBy: { date: 'desc' },
      include: { wallet: true },
    });
  }

  async remove(id: number, userId: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, wallet: { userId } },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    // Reverse the balance impact on deletion
    const deletedTx = await this.prisma.$transaction(async (tx) => {
      if (transaction.type === TransactionType.EXPENSE) {
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: { increment: transaction.amount } },
        });

        // Also reverse budget category spentAmount if applicable
        const date = new Date(transaction.date);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        if (!transaction.category) return;

        const budgetCategory = await tx.budgetCategory.findFirst({
          where: {
            name: transaction.category,
            monthlyBudget: {
              userId,
              month,
              year,
            },
          },
        });

        if (budgetCategory) {
          await tx.budgetCategory.update({
            where: { id: budgetCategory.id },
            data: { spentAmount: { decrement: transaction.amount } },
          });
        }
      } else if (transaction.type === TransactionType.INCOME) {
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: { decrement: transaction.amount } },
        });
      } else if (
        transaction.type === TransactionType.TRANSFER &&
        transaction.toWalletId
      ) {
        // Reverse transfer: increment source, decrement target
        await tx.wallet.update({
          where: { id: transaction.walletId },
          data: { balance: { increment: transaction.amount } },
        });
        await tx.wallet.update({
          where: { id: transaction.toWalletId },
          data: { balance: { decrement: transaction.amount } },
        });
      }

      // Reverse Loan Integration if applicable
      if ((transaction as any).loanId) {
        const loan = await tx.loan.findUnique({
          where: { id: (transaction as any).loanId },
        });

        if (loan) {
          const isIncomeOnReceivable = 
            transaction.type === TransactionType.INCOME && loan.type === 'RECEIVABLE';
          const isExpenseOnPayable = 
            transaction.type === TransactionType.EXPENSE && loan.type === 'PAYABLE';

          if (isIncomeOnReceivable || isExpenseOnPayable) {
            const newRemaining = loan.remaining + transaction.amount;
            await tx.loan.update({
              where: { id: (transaction as any).loanId },
              data: { 
                remaining: newRemaining,
                status: newRemaining > 0 && loan.status === 'PAID_OFF' ? 'ACTIVE' : loan.status
              },
            });
          }
        }
      }

      return tx.transaction.delete({
        where: { id },
      });
    });

    // Background AI Sync
    this.eventEmitter.emit(FINANCE_EVENT.TRANSACTION_DELETED, { entityId: id });

    return deletedTx;
  }
}
