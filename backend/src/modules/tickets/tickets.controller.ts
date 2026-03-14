import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from '@personalization/shared';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUserId() userId: number,
  ) {
    return this.ticketsService.create(createTicketDto, userId);
  }

  @Get('project/:projectId')
  findAllByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.ticketsService.findAllByProject(projectId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, updateTicketDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.remove(id);
  }
}
