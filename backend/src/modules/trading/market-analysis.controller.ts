import { Controller, Get, Post, Query, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { MarketAnalysisService } from './market-analysis.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUserId } from '../../decorators/current-user-id.decorator';

@UseGuards(JwtAuthGuard)
@Controller('trading/analysis')
export class MarketAnalysisController {
  constructor(private readonly analysisService: MarketAnalysisService) {}

  @Get()
  async getAnalysis(
    @CurrentUserId() userId: number,
    @Query('interval') interval: string,
    @Query('date') dateStr: string,
  ) {
    if (!interval || !dateStr) {
      throw new BadRequestException('interval and date query params are required');
    }
    const date = new Date(dateStr);
    return this.analysisService.getAnalysis(userId, interval, date);
  }

  @Post('generate')
  async generateAnalysis(
    @CurrentUserId() userId: number,
    @Body() body: { interval: 'DAILY' | 'WEEKLY' | 'MONTHLY'; date: string },
  ) {
    if (!body.interval || !body.date) {
      throw new BadRequestException('interval and date body fields are required');
    }
    return this.analysisService.generateAnalysis(userId, body.interval, body.date);
  }
}
