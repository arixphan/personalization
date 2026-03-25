import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  create(@Req() req, @Body() data: any) {
    return this.progressService.create(req.user.id, data);
  }

  @Get()
  findAll(
    @Req() req,
    @Query('title') title?: string,
    @Query('tags') tags?: string | string[],
  ) {
    const tagsArray = Array.isArray(tags) ? tags : tags ? [tags] : [];
    return this.progressService.findAll(req.user.id, { title, tags: tagsArray });
  }

  @Get(':id')
  findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.progressService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.progressService.update(req.user.id, id, data);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.progressService.remove(req.user.id, id);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() data: any,
  ) {
    return this.progressService.updateItem(req.user.id, id, itemId, data);
  }

  @Post(':id/items')
  addItem(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.progressService.addItem(req.user.id, id, data);
  }
}
