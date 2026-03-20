import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
} from '@nestjs/common';
import { BinanceAccountService } from './binance-account.service';
import { CurrentUserId } from 'src/decorators/current-user-id.decorator';
import { ConnectBinanceDto } from '@personalization/shared';

@Controller('trading/binance')
export class BinanceController {
  constructor(private readonly binanceService: BinanceAccountService) {}

  @Post('connect')
  connect(
    @Body() dto: ConnectBinanceDto,
    @CurrentUserId() userId: number,
  ) {
    return this.binanceService.connect(userId, dto);
  }

  @Delete('disconnect')
  disconnect(@CurrentUserId() userId: number) {
    return this.binanceService.disconnect(userId);
  }

  @Get('status')
  getStatus(@CurrentUserId() userId: number) {
    return this.binanceService.getStatus(userId);
  }

  @Get('account')
  getAccountBalance(@CurrentUserId() userId: number) {
    return this.binanceService.getAccountBalance(userId);
  }

  @Get('prices')
  getPrices() {
    return this.binanceService.getPrices();
  }
}
