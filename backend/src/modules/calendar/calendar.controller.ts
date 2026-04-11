import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateEventDto, CreateTaskDto, UpdateEventDto, UpdateTaskDto, CompleteTaskDto } from './dto/calendar.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  async findAll(
    @Req() req,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const userId = req.user.id;
    const startDate = new Date(start);
    const endDate = new Date(end);

    const [events, tasks] = await Promise.all([
      this.calendarService.findEvents(userId, startDate, endDate),
      this.calendarService.findTasks(userId, startDate, endDate),
    ]);

    return { events, tasks };
  }

  @Post('events')
  createEvent(@Req() req, @Body() dto: CreateEventDto) {
    return this.calendarService.createEvent(req.user.id, dto);
  }

  @Patch('events/:id')
  updateEvent(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
  ) {
    return this.calendarService.updateEvent(req.user.id, id, dto);
  }

  @Delete('events/:id')
  removeEvent(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.calendarService.removeEvent(req.user.id, id);
  }

  @Post('tasks')
  createTask(@Req() req, @Body() dto: CreateTaskDto) {
    return this.calendarService.createTask(req.user.id, dto);
  }

  @Patch('tasks/:id')
  updateTask(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.calendarService.updateTask(req.user.id, id, dto);
  }

  @Delete('tasks/:id')
  removeTask(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.calendarService.removeTask(req.user.id, id);
  }

  @Post('tasks/:id/complete')
  completeTask(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CompleteTaskDto,
  ) {
    return this.calendarService.completeTask(req.user.id, id, dto);
  }
}
