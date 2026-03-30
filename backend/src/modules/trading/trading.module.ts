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

import { AiModule } from '../ai/ai.module';
import { MarketDataService } from './market-data.service';
import { MarketAnalysisService } from './market-analysis.service';
import { MarketAnalysisController } from './market-analysis.controller';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [
    TradingLogController,
    StrategyController,
    BinanceController,
    NewsController,
    MarketAnalysisController,
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
    MarketDataService,
    MarketAnalysisService,
  ],
  exports: [
    TradingLogService,
    StrategyService,
    BinanceAccountService,
    NewsService,
    MarketDataService,
    MarketAnalysisService,
  ],
})
export class TradingModule {}
