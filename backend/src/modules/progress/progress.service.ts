import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, data: any) {
    const { items, ...rest } = data;
    
    // Sanitize numerical fields helper
    const parseNum = (val: any) => {
      if (val === "" || val === undefined || val === null) return null;
      if (typeof val === 'number') return val;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    };

    if ('currentValue' in rest) rest.currentValue = parseNum(rest.currentValue);
    if ('totalValue' in rest) rest.totalValue = parseNum(rest.totalValue);

    return this.prisma.progressTracker.create({
      data: {
        ...rest,
        userId,
        items: items ? {
          create: items.map((item: any, index: number) => ({
            ...item,
            position: item.position ?? index,
          })),
        } : undefined,
      },
      include: { items: true },
    });
  }

  async findAll(userId: number, query: { title?: string; tags?: string[] }) {
    const where: Prisma.ProgressTrackerWhereInput = { userId };

    if (query.title) {
      where.title = { contains: query.title, mode: 'insensitive' };
    }

    if (query.tags && query.tags.length > 0) {
      where.tags = { hasEvery: query.tags };
    }

    return this.prisma.progressTracker.findMany({
      where,
      include: { items: { orderBy: { position: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const tracker = await this.prisma.progressTracker.findUnique({
      where: { id },
      include: { items: { orderBy: { position: 'asc' } } },
    });

    if (!tracker) throw new NotFoundException('Progress tracker not found');
    if (tracker.userId !== userId) throw new ForbiddenException();

    return tracker;
  }

  async update(userId: number, id: number, data: any) {
    await this.findOne(userId, id);

    const { items, ...rest } = data;

    // Sanitize numerical fields helper
    const parseNum = (val: any) => {
      if (val === "" || val === null) return null;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
      }
      return val;
    };

    const updateData: any = { ...rest };
    if ('currentValue' in updateData) updateData.currentValue = parseNum(updateData.currentValue);
    if ('totalValue' in updateData) updateData.totalValue = parseNum(updateData.totalValue);

    // Handle items update if provided
    if (items) {
      // Simple strategy: delete existing and recreate or complex update
      // For now, let's keep it simple or implement specific item update methods
    }

    return this.prisma.progressTracker.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    return this.prisma.progressTracker.delete({ where: { id } });
  }

  // Specific item methods
  async updateItem(userId: number, trackerId: number, itemId: number, data: any) {
    await this.findOne(userId, trackerId);
    return this.prisma.progressItem.update({
      where: { id: itemId },
      data,
    });
  }

  async addItem(userId: number, trackerId: number, data: any) {
    const tracker = await this.findOne(userId, trackerId);
    
    // Calculate max position to append at the end
    const lastItem = tracker.items?.sort((a, b) => b.position - a.position)[0];
    const newPosition = lastItem ? lastItem.position + 1 : 0;

    return this.prisma.progressItem.create({
      data: {
        ...data,
        position: newPosition,
        progressTrackerId: trackerId,
      },
    });
  }
}
