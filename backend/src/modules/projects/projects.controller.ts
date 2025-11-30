import { PERMISSIONS } from 'src/constants/permission';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { Permissions } from 'src/decorators/permission.decorator';
import { ZodValidationPipe } from 'src/pipes/zod.pipe';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ValidationPipe,
  Put,
} from '@nestjs/common';

import {
  CreateProjectDto,
  CreateProjectSchema,
  UpdateProjectStatusDto,
  UpdateProjectStatusSchema,
  UpdateProjectDto,
  UpdateProjectSchema,
} from '@personalization/shared';
import { FindAllByOwnerIdDto } from './dto/find-all-by-owner-id.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Permissions(PERMISSIONS.PROJECT_WRITE)
  create(
    @Body(new ZodValidationPipe(CreateProjectSchema))
    createProjectDto: CreateProjectDto,
    @CurrentUserId() userId: number,
  ) {
    return this.projectsService.create(createProjectDto, userId);
  }

  @Get()
  @Permissions(PERMISSIONS.PROJECT_READ)
  findAllByOwnerId(
    @CurrentUserId() userId: number,
    @Query(ValidationPipe) findAllDto: FindAllByOwnerIdDto,
  ) {
    return this.projectsService.findAllByOwnerId(userId, findAllDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUserId() userId: number) {
    return this.projectsService.findOne(+id, userId);
  }

  @Put(':id')
  @Permissions(PERMISSIONS.PROJECT_WRITE)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProjectSchema))
    updateProjectDto: UpdateProjectDto,
    @CurrentUserId() userId: number,
  ) {
    return this.projectsService.update(+id, updateProjectDto, userId);
  }

  @Patch(':id/status')
  @Permissions(PERMISSIONS.PROJECT_WRITE)
  status(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProjectStatusSchema))
    updateProjectStatusDto: UpdateProjectStatusDto,
    @CurrentUserId() userId: number,
  ) {
    return this.projectsService.updateStatus(
      +id,
      updateProjectStatusDto.status,
      userId,
    );
  }
}
