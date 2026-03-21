import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto, UpdateLoanDto } from '@personalization/shared';

@Injectable()
export class LoanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateLoanDto, userId: number) {
    const { dueDate, ...rest } = dto;
    return this.prisma.loan.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
      },
    });
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
    return this.prisma.loan.update({
      where: { id },
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : (dueDate === null ? null : undefined),
      },
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.loan.delete({
      where: { id },
    });
  }
}
