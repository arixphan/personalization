import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { TradingLogService } from './trading-log.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import {
  CreateTradingLogDto,
  UpdateTradingLogDto,
} from '@personalization/shared';

@Controller('trading/logs')
export class TradingLogController {
  constructor(private readonly tradingLogService: TradingLogService) {}

  @Post()
  create(
    @Body() dto: CreateTradingLogDto,
    @CurrentUserId() userId: number,
  ) {
    return this.tradingLogService.create(dto, userId);
  }

  @Get()
  findMany(
    @CurrentUserId() userId: number,
    @Query('month') month?: string,
    @Query('week') week?: string,
    @Query('date') date?: string,
  ) {
    if (month) {
      // Expect format: YYYY-MM
      if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new BadRequestException('month must be in format YYYY-MM');
      }
      return this.tradingLogService.findByMonth(userId, month);
    }
    if (week) {
      // Expect format: YYYY-WNN
      if (!/^\d{4}-W\d{1,2}$/.test(week)) {
        throw new BadRequestException('week must be in format YYYY-WNN (e.g. 2026-W12)');
      }
      return this.tradingLogService.findByWeek(userId, week);
    }
    if (date) {
      // Expect format: YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new BadRequestException('date must be in format YYYY-MM-DD');
      }
      return this.tradingLogService.findByDate(userId, date);
    }
    // Default: return current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.tradingLogService.findByMonth(userId, currentMonth);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.tradingLogService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTradingLogDto,
    @CurrentUserId() userId: number,
  ) {
    return this.tradingLogService.update(id, dto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserId() userId: number,
  ) {
    return this.tradingLogService.remove(id, userId);
  }
}
