import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, CreateTaskDto, UpdateEventDto, UpdateTaskDto, CompleteTaskDto } from './dto/calendar.dto';
import { addDays, addWeeks, addMonths, isBefore, isAfter, startOfDay, endOfDay, parseISO } from 'date-fns';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) { }

  // --- Events ---

  async findEvents(userId: number, start: Date, end: Date) {
    return this.prisma.calendarEvent.findMany({
      where: {
        userId,
        start: { gte: start, lte: end },
      },
    });
  }

  async createEvent(userId: number, dto: CreateEventDto) {
    return this.prisma.calendarEvent.create({
      data: {
        userId,
        ...dto,
        start: new Date(dto.start),
        end: new Date(dto.end),
      },
    });
  }

  async updateEvent(userId: number, id: number, dto: UpdateEventDto) {
    await this.assertEventOwnership(userId, id);
    return this.prisma.calendarEvent.update({
      where: { id },
      data: {
        ...dto,
        start: dto.start ? new Date(dto.start) : undefined,
        end: dto.end ? new Date(dto.end) : undefined,
      },
    });
  }

  async removeEvent(userId: number, id: number) {
    await this.assertEventOwnership(userId, id);
    return this.prisma.calendarEvent.delete({ where: { id } });
  }

  // --- Tasks ---

  async findTasks(userId: number, start: Date, end: Date) {
    // Get all tasks that could potentially fall into this range
    // For simplicity, we get all tasks and then filter/expand them in memory
    // In a real large app, we'd filter by recurrenceEnd >= start
    const tasks = await this.prisma.calendarTask.findMany({
      where: {
        userId,
        OR: [
          { recurrenceEnd: null },
          { recurrenceEnd: { gte: start } },
        ],
      },
      include: {
        completions: {
          where: {
            completedAt: { gte: start, lte: end },
          },
        },
      },
    });

    const expandedTasks: any[] = [];

    for (const task of tasks) {
      const occurrences = this.generateOccurrences(task, start, end);
      for (const occurrenceDate of occurrences) {
        const isCompleted = task.completions.some(
          (c) => startOfDay(c.completedAt).getTime() === startOfDay(occurrenceDate).getTime()
        );
        expandedTasks.push({
          ...task,
          id: `task-${task.id}-${occurrenceDate.getTime()}`,
          originalId: task.id,
          start: occurrenceDate.toISOString(),
          isCompleted,
          isTask: true,
        });
      }
    }

    return expandedTasks;
  }

  async createTask(userId: number, dto: CreateTaskDto) {
    return this.prisma.calendarTask.create({
      data: {
        userId,
        ...dto,
        startTime: new Date(dto.startTime),
        recurrenceEnd: dto.recurrenceEnd ? new Date(dto.recurrenceEnd) : null,
      },
    });
  }

  async updateTask(userId: number, id: number, dto: UpdateTaskDto) {
    const task = await this.assertTaskOwnership(userId, id);

    let updatedStartTime: Date | undefined = undefined;
    if (dto.startTime) {
      const oldStartTime = new Date(task.startTime);
      const newStartTime = new Date(dto.startTime);
      updatedStartTime = new Date(oldStartTime);
      updatedStartTime.setHours(
        newStartTime.getHours(),
        newStartTime.getMinutes(),
        newStartTime.getSeconds(),
        newStartTime.getMilliseconds()
      );
    }

    return this.prisma.calendarTask.update({
      where: { id },
      data: {
        ...dto,
        startTime: updatedStartTime,
        recurrenceEnd: dto.recurrenceEnd ? new Date(dto.recurrenceEnd) : undefined,
      },
    });
  }

  async removeTask(userId: number, id: number) {
    await this.assertTaskOwnership(userId, id);
    return this.prisma.calendarTask.delete({ where: { id } });
  }

  async completeTask(userId: number, taskId: number, dto: CompleteTaskDto) {
    const completedAt = startOfDay(new Date(dto.completedAt));

    // Check if already completed
    const existing = await this.prisma.taskCompletion.findUnique({
      where: {
        taskId_completedAt: {
          taskId,
          completedAt,
        },
      },
    });

    if (existing) {
      return this.prisma.taskCompletion.delete({
        where: { id: existing.id },
      });
    }

    return this.prisma.taskCompletion.create({
      data: {
        taskId,
        userId,
        completedAt,
      },
    });
  }

  // --- Helpers ---

  private generateOccurrences(task: any, rangeStart: Date, rangeEnd: Date): Date[] {
    const occurrences: Date[] = [];
    let current = new Date(task.startTime);
    const recurrenceEnd = task.recurrenceEnd || endOfDay(new Date(new Date().getFullYear(), 11, 31));

    const limit = isBefore(recurrenceEnd, rangeEnd) ? recurrenceEnd : rangeEnd;

    // Fast forward to rangeStart if possible
    // (This is a naive implementation; for many years of data it might be slow, but for "current year" it's fine)

    while (isBefore(current, limit) || current.getTime() === limit.getTime()) {
      if ((isAfter(current, rangeStart) || current.getTime() === rangeStart.getTime()) &&
        (isBefore(current, rangeEnd) || current.getTime() === rangeEnd.getTime())) {
        occurrences.push(new Date(current));
      }

      if (task.recurrence === 'NONE') break;
      if (task.recurrence === 'DAILY') current = addDays(current, 1);
      else if (task.recurrence === 'WEEKLY') current = addWeeks(current, 1);
      else if (task.recurrence === 'MONTHLY') current = addMonths(current, 1);
      else break;

      if (isAfter(current, limit)) break;
    }

    return occurrences;
  }

  private async assertEventOwnership(userId: number, id: number) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.userId !== userId) throw new ForbiddenException('Access denied');
    return event;
  }

  private async assertTaskOwnership(userId: number, id: number) {
    const task = await this.prisma.calendarTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.userId !== userId) throw new ForbiddenException('Access denied');
    return task;
  }
}
