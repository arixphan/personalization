import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, UpdateAssetDto } from '@personalization/shared';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FINANCE_EVENT } from '../ai/events/finance.events';

@Injectable()
export class AssetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateAssetDto, userId: number) {
    const asset = await this.prisma.asset.create({
      data: {
        ...dto,
        userId,
      },
    });
    this.eventEmitter.emit(FINANCE_EVENT.ASSET_CREATED, { userId, asset });
    return asset;
  }

  async findAll(userId: number) {
    return this.prisma.asset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, userId },
    });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }
    return asset;
  }

  async update(id: number, dto: UpdateAssetDto, userId: number) {
    await this.findOne(id, userId);
    const asset = await this.prisma.asset.update({
      where: { id },
      data: dto,
    });
    this.eventEmitter.emit(FINANCE_EVENT.ASSET_UPDATED, { userId, asset });
    return asset;
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    const asset = await this.prisma.asset.delete({
      where: { id },
    });
    this.eventEmitter.emit(FINANCE_EVENT.ASSET_DELETED, { entityId: id });
    return asset;
  }
}
