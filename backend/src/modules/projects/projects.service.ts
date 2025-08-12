import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { PrismaService } from '../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateProjectDto } from './dto/update-project.dto';
import { paginator } from 'src/lib/paginator';
import { Prisma } from '@prisma/client';
import { FindAllByOwnerIdDto } from './dto/find-all-by-owner-id.dto';

const paginate = paginator({ page: 1, perPage: 10 });
const defaultStatus = ['ACTIVE', 'ON-HOLD', 'COMPLETED'];

@Injectable()
export class ProjectsService {
  constructor(private readonly prismaService: PrismaService) {}
  private readonly logger = new Logger(ProjectsService.name);

  private requireOwnerId(userId) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
  }

  private handlePrismaKnownError(error: PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new BadRequestException('Project with this title already exists');
    }

    if (error.code === 'P2025') {
      throw new NotFoundException('Project with this id does not exist');
    }
  }

  async create(createProjectDto: CreateProjectDto, userId: number) {
    this.requireOwnerId(userId);

    try {
      const { title, type, description, columns, tags, version } =
        createProjectDto;
      const project = await this.prismaService.project.create({
        data: {
          title,
          description,
          type,
          version,
          tags,
          columns,
          ownerId: userId,
        },
      });
      return project;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.handlePrismaKnownError(error);
      }
      this.logger.error('Failed to create project', error);
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async findAllByOwnerId(userId: number, findAllDto: FindAllByOwnerIdDto) {
    const {
      limit,
      page,
      search,
      sortOrder,
      sortBy,
      status = defaultStatus,
      type,
    } = findAllDto;
    const sanitizedTerm = search
      ?.trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' & ');

    const where: Prisma.ProjectWhereInput = {
      ownerId: userId,
      title: { search: sanitizedTerm },
      description: { search: sanitizedTerm },
      status: { in: status },
      type: type ? { in: type } : undefined,
    };

    return paginate(
      async () => {
        return this.prismaService.project.count({ where });
      },
      async (take: number, skip: number) => {
        return this.prismaService.project.findMany({
          skip,
          take,
          where,
          orderBy: this.buildFindAllOrderBy(sortBy, sortOrder),
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            type: true,
            createdAt: true,
          },
        });
      },
      {
        page,
        perPage: limit,
      },
    );
  }

  private buildFindAllOrderBy(
    sortBy: string | undefined,
    sortOrder: string | undefined,
  ):
    | Prisma.ProjectOrderByWithRelationInput
    | Prisma.ProjectOrderByWithRelationInput[] {
    let orderBy:
      | Prisma.ProjectOrderByWithRelationInput
      | Prisma.ProjectOrderByWithRelationInput[];

    if (sortBy && sortBy !== 'status') {
      orderBy = {
        [sortBy]: sortOrder,
      };
    } else {
      orderBy = [
        {
          status: 'asc',
        },
        {
          createdAt: 'desc',
        },
        { id: 'desc' },
      ];
    }
    return orderBy;
  }

  async findOne(id: number, userId: number) {
    this.requireOwnerId(userId);
    try {
      const project = await this.prismaService.project.findUniqueOrThrow({
        where: { id, ownerId: userId },
      });
      return project;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        this.handlePrismaKnownError(error);
      }

      this.logger.error(
        `Failed to get project ${id} for user ${userId}`,
        error,
      );
      throw new InternalServerErrorException('Failed to retrieve project');
    }
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, userId: number) {
    this.requireOwnerId(userId);

    const project = await this.prismaService.project.findUnique({
      where: { id: id },
      select: { id: true, ownerId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to update this project',
      );
    }

    try {
      return await this.prismaService.project.update({
        where: { id },
        data: {
          ...updateProjectDto,
        },
      });
    } catch (error) {
      this.logger.error('Failed to update project', error);

      if (error instanceof PrismaClientKnownRequestError) {
        this.handlePrismaKnownError(error);
      }
      throw new InternalServerErrorException('Failed to update project');
    }
  }

  async updateStatus(id: number, status: string, userId: number) {
    this.requireOwnerId(userId);
    try {
      const project = await this.prismaService.project.findUnique({
        where: { id, ownerId: userId },
      });

      if (!project) {
        throw new NotFoundException(
          `Project with id ${id} not found or you don't have access to it`,
        );
      }

      const updatedProject = await this.prismaService.project.update({
        where: { id, ownerId: userId },
        data: { status },
      });
      return updatedProject;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw without wrapping
      }

      this.logger.error(
        `Failed to get project ${id} for user ${userId}`,
        error,
      );
      throw new InternalServerErrorException('Failed to update project status');
    }
  }
}
