import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto, UpdateLoanDto } from '@personalization/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FINANCE_EVENT } from '../ai/events/finance.events';

@Injectable()
export class LoanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateLoanDto, userId: number) {
    const { dueDate, ...rest } = dto;
    const loan = await this.prisma.loan.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
      },
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
    await this.findOne(id, userId);
    const { dueDate, ...rest } = dto;
    const loan = await this.prisma.loan.update({
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
