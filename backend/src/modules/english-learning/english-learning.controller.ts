import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { EnglishLearningService } from './english-learning.service';
import { CreateEnglishRecordDto } from './dtos/create-english-record.dto';
import { UpdateEnglishRecordDto } from './dtos/update-english-record.dto';
import { GenerateAiContentDto } from './dtos/generate-ai-content.dto';
import { CreateWritingDto } from './dtos/create-writing.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('english-learning')
@UseGuards(JwtAuthGuard)
export class EnglishLearningController {
  constructor(private readonly service: EnglishLearningService) {}

  @Get()
  findAll(
    @Req() req,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(req.user.id, { type, search });
  }

  @Get('random')
  getRandom(@Req() req, @Query('type') type?: string) {
    return this.service.getRandom(req.user.id, type);
  }

  @Post()
  create(@Req() req, @Body() dto: CreateEnglishRecordDto) {
    return this.service.create(req.user.id, dto);
  }

  @Post('ai-assist')
  generateAiContent(@Req() req, @Body() dto: GenerateAiContentDto) {
    return this.service.generateAiContent(req.user.id, dto);
  }

  // Writing Coach Endpoints

  @Get('writings')
  findAllWritings(@Req() req) {
    return this.service.findAllWritings(req.user.id);
  }

  @Post('writings')
  createWriting(@Req() req, @Body() dto: CreateWritingDto) {
    return this.service.createWriting(req.user.id, dto);
  }

  @Get('writings/:id')
  findWritingById(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.findWritingById(req.user.id, id);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEnglishRecordDto,
  ) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.service.remove(req.user.id, id);
  }
}
