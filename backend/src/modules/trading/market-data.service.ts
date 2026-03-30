import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import Binance from 'binance-api-node';

export interface PriceDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi?: number;
}

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private client: any;

  constructor() {
    this.client = Binance(); // Public unauthenticated client
  }

  /**
   * Fetches historical K-lines (candlesticks) for a given symbol.
   */
  async getKlines(symbol: string, interval: string, limit: number): Promise<PriceDataPoint[]> {
    try {
      const candles = await this.client.candles({ symbol, interval, limit });
      return candles.map((c: any) => ({
        time: c.openTime,
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
        volume: parseFloat(c.volume),
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch klines for ${symbol} - ${interval}`, error);
      throw new InternalServerErrorException(`Failed to fetch market data for ${symbol}`);
    }
  }

  /**
   * Calculates the Relative Strength Index (RSI) for a given set of price points.
   */
  calculateRSI(data: PriceDataPoint[], period: number = 14): PriceDataPoint[] {
    if (data.length <= period) {
      return data;
    }

    let sumGain = 0;
    let sumLoss = 0;

    // Calculate initial average gain/loss
    for (let i = 1; i <= period; i++) {
      const difference = data[i].close - data[i - 1].close;
      if (difference >= 0) {
        sumGain += difference;
      } else {
        sumLoss += Math.abs(difference);
      }
    }

    let avgGain = sumGain / period;
    let avgLoss = sumLoss / period;

    // First RSI value
    data[period].rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));

    // Calculate subsequent RSI values using Smoothed Moving Average (Wilder's Smoothing)
    for (let i = period + 1; i < data.length; i++) {
      const difference = data[i].close - data[i - 1].close;
      const currentGain = difference >= 0 ? difference : 0;
      const currentLoss = difference < 0 ? Math.abs(difference) : 0;

      avgGain = ((avgGain * (period - 1)) + currentGain) / period;
      avgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;

      if (avgLoss === 0) {
        data[i].rsi = 100;
      } else {
        const rs = avgGain / avgLoss;
        data[i].rsi = 100 - (100 / (1 + rs));
      }
    }

    return data;
  }

  /**
   * Fetches the market snapshot containing price flows and RSI.
   */
  async getMarketSnapshot(symbol: string, intervalStr: 'DAILY' | 'WEEKLY' | 'MONTHLY'): Promise<PriceDataPoint[]> {
    let limit = 100; // Enough data to accurately calculate a 14-period RSI and have recent history
    let binanceInterval = '1h'; 

    switch (intervalStr) {
      case 'DAILY':
        binanceInterval = '1h';
        limit = 40; // Past 40 hours is enough for 24h context + 14-period RSI calculation
        break;
      case 'WEEKLY':
        binanceInterval = '1d';
        limit = 21; // Past 21 days is enough for 7d context + 14-period RSI
        break;
      case 'MONTHLY':
        binanceInterval = '1d';
        limit = 45; // Past 45 days is enough for 30d context + 14-period RSI
        break;
    }

    const klines = await this.getKlines(symbol, binanceInterval, limit);
    return this.calculateRSI(klines);
  }
}
