import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, TransactionType } from '@personalization/shared';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          ...dto,
          date: dto.date ? new Date(dto.date) : new Date(),
        },
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
        if (dto.type === TransactionType.EXPENSE || dto.type === TransactionType.TRANSFER) {
          // 1. Fetch current wallet balance
          const wallet = await tx.wallet.findUnique({
            where: { id: dto.walletId },
            select: { balance: true }
          });
          
          if (!wallet) throw new NotFoundException('Wallet not found');

          // 2. Check sufficient funds
          if (wallet.balance < dto.amount) {
            throw new BadRequestException('Insufficient funds in source wallet');
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

      return transaction;
    });
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
    return this.prisma.$transaction(async (tx) => {
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
      } else if (transaction.type === TransactionType.TRANSFER && transaction.toWalletId) {
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

      return tx.transaction.delete({
        where: { id },
      });
    });
  }
}
