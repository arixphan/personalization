import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletDto, UpdateWalletDto } from '@personalization/shared';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWalletDto, userId: number) {
    return this.prisma.wallet.create({
      data: {
        ...dto,
        userId,
      },
    });
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
    return this.prisma.wallet.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.wallet.delete({
      where: { id },
    });
  }
}
