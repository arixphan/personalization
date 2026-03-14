import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, UpdateTicketDto } from '@personalization/shared';
import { Prisma } from '@prisma/client';

@Injectable()
export class TicketsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    return (this.prisma as any).ticket.create({
      data,
    });
  }

  async findMany(where: any) {
    return (this.prisma as any).ticket.findMany({
      where,
      orderBy: { position: 'asc' },
    });
  }

  async findById(id: number) {
    return (this.prisma as any).ticket.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: any) {
    return (this.prisma as any).ticket.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return (this.prisma as any).ticket.delete({
      where: { id },
    });
  }
}
