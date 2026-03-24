import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MindMapService } from './mind-maps.service';
import { MindMapAiService } from './mind-map-ai.service';
import { CreateMindMapDto } from './dto/create-mind-map.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUserId } from '../../decorators/current-user-id.decorator';

@Controller('mind-maps')
@UseGuards(JwtAuthGuard)
export class MindMapController {
  constructor(
    private readonly mindMapService: MindMapService,
    private readonly aiService: MindMapAiService,
  ) {}

  @Post()
  create(@CurrentUserId() userId: number, @Body() dto: CreateMindMapDto) {
    return this.mindMapService.create(userId, dto);
  }

  @Post('generate')
  generate(@CurrentUserId() userId: number, @Body('topic') topic: string) {
    return this.aiService.generateFromTopic(userId, topic);
  }

  @Post(':id/expand')
  expand(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body('nodeId') nodeId: string,
    @Body('context') context: any,
  ) {
    return this.aiService.expandNode(userId, context, nodeId);
  }

  @Get()
  findAll(@CurrentUserId() userId: number) {
    return this.mindMapService.findAll(userId);
  }

  @Get(':id')
  findOne(@CurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.mindMapService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.mindMapService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.mindMapService.remove(userId, id);
  }
}
