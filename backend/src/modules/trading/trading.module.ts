import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { TradingLogController } from './trading-log.controller';
import { TradingLogService } from './trading-log.service';
import { TradingLogRepository } from './trading-log.repository';
import { StrategyController } from './strategy.controller';
import { StrategyService } from './strategy.service';
import { StrategyRepository } from './strategy.repository';

import { BinanceController } from './binance.controller';
import { BinanceAccountService } from './binance-account.service';
import { CryptoService } from './crypto.service';
import { TradingAccountRepository } from './trading-account.repository';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    TradingLogController,
    StrategyController,
    BinanceController,
    NewsController,
  ],
  providers: [
    TradingLogService,
    TradingLogRepository,
    StrategyService,
    StrategyRepository,
    BinanceAccountService,
    CryptoService,
    TradingAccountRepository,
    NewsService,
  ],
  exports: [TradingLogService, StrategyService, BinanceAccountService, NewsService],
})
export class TradingModule {}
