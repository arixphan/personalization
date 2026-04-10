import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dtos/create-note.dto';
import { UpdateNoteDto } from './dtos/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.note.findMany({
      where: { userId },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async create(userId: number, dto: CreateNoteDto) {
    return this.prisma.note.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content,
        color: dto.color ?? '#6366f1',
        isPinned: dto.isPinned ?? false,
      },
    });
  }

  async update(userId: number, id: number, dto: UpdateNoteDto) {
    await this.assertOwnership(userId, id);
    return this.prisma.note.update({
      where: { id },
      data: dto,
    });
  }

  async togglePin(userId: number, id: number) {
    const note = await this.assertOwnership(userId, id);
    return this.prisma.note.update({
      where: { id },
      data: { isPinned: !note.isPinned },
    });
  }

  async remove(userId: number, id: number) {
    await this.assertOwnership(userId, id);
    return this.prisma.note.delete({ where: { id } });
  }

  private async assertOwnership(userId: number, id: number) {
    const note = await this.prisma.note.findUnique({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== userId) throw new ForbiddenException('Access denied');
    return note;
  }
}
