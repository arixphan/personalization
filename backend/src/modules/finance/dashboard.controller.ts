import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';

@Controller('finance/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('net-worth')
  getNetWorth(@CurrentUserId() userId: number) {
    return this.dashboardService.getNetWorth(userId);
  }

  @Get('cash-flow')
  getCashFlow(
    @CurrentUserId() userId: number,
    @Query('year') year?: string,
  ) {
    const queryYear = year ? parseInt(year) : new Date().getFullYear();
    return this.dashboardService.getCashFlow(userId, queryYear);
  }
}
