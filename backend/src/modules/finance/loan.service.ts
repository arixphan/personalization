import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto, LoanType, UpdateLoanDto, TransactionType, LoanStatus } from '@personalization/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FINANCE_EVENT } from '../ai/events/finance.events';
import { TransactionService } from './transaction.service';

@Injectable()
export class LoanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly transactionService: TransactionService,
  ) { }

  async create(dto: CreateLoanDto, userId: number) {
    if (dto.remaining > dto.principal) {
      throw new BadRequestException('Remaining amount cannot exceed principal');
    }
    const loan = await this.prisma.$transaction(async (tx) => {
      const { dueDate, walletId, ...rest } = dto;
      
      // If wallet is provided, we'll let transaction service handle the balance state
      // so we initialize to 0 to avoid double-counting.
      const initialRemaining = walletId ? 0 : rest.remaining;
      const initialStatus = walletId 
        ? LoanStatus.ACTIVE 
        : (rest.remaining === 0 ? LoanStatus.PAID_OFF : LoanStatus.ACTIVE);

      const loan = await tx.loan.create({
        data: {
          ...rest,
          remaining: initialRemaining,
          status: initialStatus,
          dueDate: dueDate ? new Date(dueDate) : null,
          userId,
        },
      });

      // Handle automatic transactions if wallet is provided
      if (walletId) {
        // 1. Log the principal movement
        // Date is "today" per user requirement
        await this.transactionService.create({
          type: loan.type === LoanType.PAYABLE ? TransactionType.INCOME : TransactionType.EXPENSE,
          amount: loan.principal,
          walletId,
          note: `Initial principal for loan: ${loan.counterparty}`,
          date: new Date().toISOString(),
          loanId: loan.id,
        }, userId, tx);

        // 2. Log the "difference" (any payments already made before tracking)
        const paidAmount = loan.principal - dto.remaining;
        if (paidAmount > 0) {
          await this.transactionService.create({
            type: loan.type === LoanType.PAYABLE ? TransactionType.EXPENSE : TransactionType.INCOME,
            amount: paidAmount,
            walletId,
            note: `Initial adjustment/payment for loan: ${loan.counterparty}`,
            date: new Date().toISOString(),
            loanId: loan.id,
          }, userId, tx);
        }
      }

      return loan;
    });

    this.eventEmitter.emit(FINANCE_EVENT.LOAN_CREATED, { userId, loan });
    return loan;
  }

  async findAll(userId: number) {
    return this.prisma.loan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const loan = await this.prisma.loan.findFirst({
      where: { id, userId },
    });
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return loan;
  }

  async update(id: number, dto: UpdateLoanDto, userId: number) {
    const oldLoan = await this.findOne(id, userId);
    
    const principal = dto.principal !== undefined ? dto.principal : oldLoan.principal;
    const remaining = dto.remaining !== undefined ? dto.remaining : oldLoan.remaining;

    if (remaining > principal) {
      throw new BadRequestException('Remaining amount cannot exceed principal');
    }

    const { dueDate, walletId, ...rest } = dto;

    const loan = await this.prisma.$transaction(async (tx) => {
      // Handle automatic transactions on remaining change
      if (walletId && rest.remaining !== undefined && rest.remaining !== oldLoan.remaining) {
        const delta = oldLoan.remaining - rest.remaining;
        if (delta !== 0) {
          await this.transactionService.create({
            type: delta > 0
              ? (oldLoan.type === LoanType.PAYABLE ? TransactionType.EXPENSE : TransactionType.INCOME)
              : (oldLoan.type === LoanType.PAYABLE ? TransactionType.INCOME : TransactionType.EXPENSE),
            amount: Math.abs(delta),
            walletId,
            note: `Loan balance manual adjustment: ${oldLoan.counterparty}`,
            date: new Date().toISOString(),
            loanId: oldLoan.id,
          }, userId, tx);
          
          // CRITICAL: Remove remaining from rest so it's NOT updated in tx.loan.update
          // This prevents the double-deduction bug because transactionService already updated it.
          delete (rest as any).remaining;
          delete (rest as any).status;
        }
      }

      // Determine status if remaining is changing (manually, without wallet)
      if (rest.remaining !== undefined) {
        rest.status = rest.remaining === 0 ? LoanStatus.PAID_OFF : LoanStatus.ACTIVE;
      }

      const loan = await tx.loan.update({
        where: { id },
        data: {
          ...rest,
          dueDate: dueDate
            ? new Date(dueDate)
            : dueDate === null
              ? null
              : undefined,
        },
      });

      return loan;
    });

    this.eventEmitter.emit(FINANCE_EVENT.LOAN_UPDATED, { userId, loan });
    return loan;
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    const loan = await this.prisma.loan.delete({
      where: { id },
    });
    this.eventEmitter.emit(FINANCE_EVENT.LOAN_DELETED, { entityId: id });
    return loan;
  }
}
