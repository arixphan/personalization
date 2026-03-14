import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { TicketsRepository } from './tickets.repository';
import { PrismaModule } from '../prisma';
import { ProjectsModule } from '../projects/projects.module';
import { ProjectsRepository } from '../projects/projects.repository';

@Module({
  imports: [PrismaModule, ProjectsModule],
  providers: [TicketsService, TicketsRepository, ProjectsRepository],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
