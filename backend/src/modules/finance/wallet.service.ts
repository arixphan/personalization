import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletDto, UpdateWalletDto } from '@personalization/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FINANCE_EVENT } from '../ai/events/finance.events';

@Injectable()
export class WalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateWalletDto, userId: number) {
    const wallet = await this.prisma.wallet.create({
      data: {
        ...dto,
        userId,
      },
    });
    this.eventEmitter.emit(FINANCE_EVENT.WALLET_UPDATED, { userId, wallet });
    return wallet;
  }

  async findAll(userId: number) {
    return this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, userId },
    });
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    return wallet;
  }

  async update(id: number, dto: UpdateWalletDto, userId: number) {
    await this.findOne(id, userId);
    const wallet = await this.prisma.wallet.update({
      where: { id },
      data: dto,
    });
    this.eventEmitter.emit(FINANCE_EVENT.WALLET_UPDATED, { userId, wallet });
    return wallet;
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    const wallet = await this.prisma.wallet.delete({
      where: { id },
    });
    this.eventEmitter.emit(FINANCE_EVENT.TRANSACTION_DELETED, { entityId: id }); // Using generic delete listener
    return wallet;
  }
}
