import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { StrategyService } from './strategy.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import {
  CreateStrategyDto,
  UpdateStrategyDto,
  ReorderStrategiesDto,
} from '@personalization/shared';

@Controller('trading/strategies')
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Post()
  create(@Body() dto: CreateStrategyDto, @CurrentUserId() userId: number) {
    return this.strategyService.create(dto, userId);
  }

  @Get()
  findAll(@CurrentUserId() userId: number) {
    return this.strategyService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.strategyService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStrategyDto,
    @CurrentUserId() userId: number,
  ) {
    return this.strategyService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.strategyService.remove(id, userId);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderStrategiesDto, @CurrentUserId() userId: number) {
    return this.strategyService.reorder(dto, userId);
  }
}
