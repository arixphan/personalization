import { z } from 'zod';
import { PrismaService } from '../../prisma';
import { AiTool, AiToolResult } from '../types/tool.types';

export class GetProjectsTool implements AiTool {
  name = 'get_projects';
  description = 'Returns a list of all active projects with their status.';
  inputSchema = z.object({});
  requiresConfirmation = false;

  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number): Promise<AiToolResult> {
    const projects = await this.prisma.project.findMany({
      where: { ownerId: userId, status: 'ACTIVE' },
    });

    return {
      success: true,
      data: projects.map((p) => ({
        title: p.title,
        type: p.type,
        version: p.version,
      })),
    };
  }
}

export class GetTicketsTool implements AiTool {
  name = 'get_tickets';
  description = 'Returns tickets for a specific project.';
  inputSchema = z.object({
    projectTitle: z.string(),
    status: z.string().optional(),
  });
  requiresConfirmation = false;

  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: number,
    input: { projectTitle: string; status?: string },
  ): Promise<AiToolResult> {
    const project = await this.prisma.project.findFirst({
      where: { ownerId: userId, title: input.projectTitle },
    });

    if (!project) return { success: false, error: 'Project not found' };

    const tickets = await this.prisma.ticket.findMany({
      where: {
        projectId: project.id,
        status: input.status,
      },
    });

    return {
      success: true,
      data: tickets.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
      })),
    };
  }
}

export class CreateProjectTool implements AiTool {
  name = 'create_project';
  description = 'Creates a new project.';
  inputSchema = z.object({
    title: z.string().describe('The title of the project'),
    description: z.string().optional().describe('Brief description'),
    type: z.string().describe('Project type (e.g., "Personal", "Work")'),
  });
  requiresConfirmation = true;

  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: number,
    input: { title: string; description?: string; type: string },
  ): Promise<AiToolResult> {
    const project = await this.prisma.project.create({
      data: {
        title: input.title,
        description: input.description,
        type: input.type,
        ownerId: userId,
      },
    });

    return {
      success: true,
      data: { id: project.id, title: project.title },
    };
  }
}

export class UpdateProjectTool implements AiTool {
  name = 'update_project';
  description = 'Updates an existing project status or details.';
  inputSchema = z.object({
    title: z.string().describe('The current title of the project to find it'),
    status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
    description: z.string().optional(),
    newTitle: z.string().optional().describe('To rename the project'),
  });
  requiresConfirmation = true;

  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: number,
    input: {
      title: string;
      status?: any;
      description?: string;
      newTitle?: string;
    },
  ): Promise<AiToolResult> {
    const project = await this.prisma.project.findFirst({
      where: { ownerId: userId, title: input.title },
    });

    if (!project) return { success: false, error: 'Project not found' };

    const updated = await this.prisma.project.update({
      where: { id: project.id },
      data: {
        status: input.status,
        description: input.description,
        title: input.newTitle,
      },
    });

    return {
      success: true,
      data: { id: updated.id, title: updated.title, status: updated.status },
    };
  }
}

export class CreateTicketTool implements AiTool {
  name = 'create_ticket';
  description = 'Creates a new ticket/task within a project.';
  inputSchema = z.object({
    projectTitle: z.string().describe('Title of the project to add the ticket to'),
    title: z.string().describe('Title of the task'),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional().default('PENDING'),
  });
  requiresConfirmation = false;

  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: number,
    input: {
      projectTitle: string;
      title: string;
      description?: string;
      priority?: any;
      status?: any;
    },
  ): Promise<AiToolResult> {
    const project = await this.prisma.project.findFirst({
      where: { ownerId: userId, title: input.projectTitle },
    });

    if (!project) return { success: false, error: 'Project not found' };

    const ticket = await this.prisma.ticket.create({
      data: {
        projectId: project.id,
        title: input.title,
        description: input.description,
        priority: input.priority,
        status: input.status,
      },
    });

    return {
      success: true,
      data: { id: ticket.id, title: ticket.title },
    };
  }
}

export class UpdateTicketTool implements AiTool {
  name = 'update_ticket';
  description = 'Updates an existing ticket status or details.';
  inputSchema = z.object({
    ticketId: z.number().describe('The ID of the ticket'),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    description: z.string().optional(),
    title: z.string().optional(),
  });
  requiresConfirmation = false;

  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: number,
    input: {
      ticketId: number;
      status?: any;
      priority?: any;
      description?: string;
      title?: string;
    },
  ): Promise<AiToolResult> {
    const ticket = await this.prisma.ticket.update({
      where: { id: input.ticketId }, // TODO: Check ownership if needed by joining project
      data: {
        status: input.status,
        priority: input.priority,
        description: input.description,
        title: input.title,
      },
    });

    return {
      success: true,
      data: { id: ticket.id, title: ticket.title, status: ticket.status },
    };
  }
}
