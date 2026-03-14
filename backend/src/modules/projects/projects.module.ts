import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../prisma';
import { ProjectsRepository } from './projects.repository';

@Module({
  imports: [PrismaModule],
  exports: [ProjectsService],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule {}
