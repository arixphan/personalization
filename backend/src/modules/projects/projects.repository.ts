import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from '@personalization/shared';
import { FindAllByOwnerIdDto } from './dto/find-all-by-owner-id.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, ownerId: number) {
    const { title, type, description, columns, tags, version } =
      createProjectDto;

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          title,
          description,
          type,
          version,
          tags,
          columns,
          ownerId,
        },
      });

      await tx.phase.create({
        data: {
          title: 'Active Phase',
          status: 'IN_PROGRESS',
          projectId: project.id,
          startDate: undefined,
          endDate: undefined,
        } as any,
      });

      return project;
    });
  }

  async count(where: Prisma.ProjectWhereInput) {
    return this.prisma.project.count({ where });
  }

  async findMany(
    where: Prisma.ProjectWhereInput,
    skip: number,
    take: number,
    orderBy: any,
  ) {
    return this.prisma.project.findMany({
      skip,
      take,
      where,
      orderBy,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        type: true,
        createdAt: true,
      },
    });
  }

  async findByIdAndOwner(id: number, ownerId: number) {
    return this.prisma.project.findUnique({
      where: { id, ownerId },
    });
  }

  async findByIdAndOwnerOrThrow(id: number, ownerId: number) {
    return this.prisma.project.findUniqueOrThrow({
      where: { id, ownerId },
      include: {
        phases: {
          where: { status: 'IN_PROGRESS' },
          take: 1,
        },
      },
    });
  }

  async findById(id: number) {
    return this.prisma.project.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: number, status: string, ownerId: number) {
    return this.prisma.project.update({
      where: { id, ownerId },
      data: { status },
    });
  }
}
