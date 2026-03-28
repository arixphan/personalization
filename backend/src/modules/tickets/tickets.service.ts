import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { CreateTicketDto, UpdateTicketDto } from '@personalization/shared';
import { TicketsRepository } from './tickets.repository';
import { ProjectsRepository } from '../projects/projects.repository';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    private readonly ticketsRepository: TicketsRepository,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async create(createTicketDto: CreateTicketDto, userId: number) {
    this.logger.log(
      `Creating ticket for project ${createTicketDto.projectId} by user ${userId}`,
    );
    const { projectId, status, phaseId, ...rest } = createTicketDto;

    const project = await this.projectsRepository.findByIdAndOwner(
      projectId,
      userId,
    );
    if (!project) {
      this.logger.error(
        `Project ${projectId} not found or not owned by user ${userId}`,
      );
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Default status logic
    let finalStatus = status;
    if (!finalStatus && project['columns'] && project['columns'].length > 0) {
      finalStatus = project['columns'][0];
    }

    // Initial position logic
    const restData = rest as any;
    let finalPosition = restData.position;
    if (finalPosition === undefined || finalPosition === 0) {
      const existingTickets = await this.findAllByProject(projectId);
      const contextualTickets = existingTickets.filter(
        (t) =>
          t.status === (finalStatus || 'OPEN') &&
          t.phaseId === (phaseId || null),
      );
      if (contextualTickets.length > 0) {
        const maxPos = Math.max(
          ...contextualTickets.map((t) => t.position || 0),
        );
        finalPosition = maxPos + 1024;
      } else {
        finalPosition = 1024;
      }
    }

    try {
      const ticketData = {
        ...rest,
        status: finalStatus || 'OPEN',
        position: finalPosition,
        project: { connect: { id: projectId } },
        phase: phaseId ? { connect: { id: phaseId } } : undefined,
      };

      const ticket = await this.ticketsRepository.create(ticketData);
      this.logger.log(`Ticket created successfully: ${ticket.id}`);
      return ticket;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(`Ticket with this title already exists`);
      }
      this.logger.error('Failed to create ticket', error);
      throw new InternalServerErrorException('Failed to create ticket');
    }
  }

  async findAllByProject(projectId: number) {
    return this.ticketsRepository.findMany({ projectId });
  }

  async findOne(id: number) {
    const ticket = await this.ticketsRepository.findById(id);
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto) {
    const { projectId, phaseId, ...rest } = updateTicketDto;

    try {
      this.logger.log(`Updating ticket ${id}`);
      const updateData: any = {
        ...rest,
        project: projectId ? { connect: { id: projectId } } : undefined,
      };

      if (phaseId !== undefined) {
        if (phaseId === null) {
          updateData.phase = { disconnect: true };
        } else {
          updateData.phase = { connect: { id: phaseId } };
        }
      }

      return await this.ticketsRepository.update(id, updateData);
    } catch (error) {
      this.logger.error(`Failed to update ticket ${id}`, error);
      throw new InternalServerErrorException('Failed to update ticket');
    }
  }

  async remove(id: number) {
    try {
      return await this.ticketsRepository.delete(id);
    } catch (error) {
      this.logger.error(`Failed to delete ticket ${id}`, error);
      throw new InternalServerErrorException('Failed to delete ticket');
    }
  }
}
