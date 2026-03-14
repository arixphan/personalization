import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProjectDto, UpdateProjectDto } from '@personalization/shared';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { paginator } from 'src/lib/paginator';
import { Prisma } from '@prisma/client';
import { FindAllByOwnerIdDto } from './dto/find-all-by-owner-id.dto';
import { ProjectsRepository } from './projects.repository';

const paginate = paginator({ page: 1, perPage: 10 });
const defaultStatus = ['ACTIVE', 'ON-HOLD', 'COMPLETED'];

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}
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
      const project = await this.projectsRepository.create(createProjectDto, userId);
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
        return this.projectsRepository.count(where);
      },
      async (take: number, skip: number) => {
        return this.projectsRepository.findMany(
          where,
          skip,
          take,
          this.buildFindAllOrderBy(sortBy, sortOrder)
        );
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
      const project = await this.projectsRepository.findByIdAndOwnerOrThrow(id, userId);
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

    const project = await this.projectsRepository.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to update this project',
      );
    }

    try {
      return await this.projectsRepository.update(id, updateProjectDto);
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
      const project = await this.projectsRepository.findByIdAndOwner(id, userId);

      if (!project) {
        throw new NotFoundException(
          `Project with id ${id} not found or you don't have access to it`,
        );
      }

      const updatedProject = await this.projectsRepository.updateStatus(id, status, userId);
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
