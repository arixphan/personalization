import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto, UpdateAssetDto } from '@personalization/shared';

@Injectable()
export class AssetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAssetDto, userId: number) {
    return this.prisma.asset.create({
      data: {
        ...dto,
        userId,
      },
    });
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
    return this.prisma.asset.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    return this.prisma.asset.delete({
      where: { id },
    });
  }
}
