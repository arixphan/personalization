import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import Binance from 'binance-api-node';
import { TradingAccountRepository } from './trading-account.repository';
import { CryptoService } from './crypto.service';
import { ConnectBinanceDto } from '@personalization/shared';

@Injectable()
export class BinanceAccountService {
  private readonly logger = new Logger(BinanceAccountService.name);

  constructor(
    private readonly accountRepository: TradingAccountRepository,
    private readonly cryptoService: CryptoService,
  ) {}

  async connect(userId: number, dto: ConnectBinanceDto) {
    try {
      // 1. Verify the credentials are valid by making a test call
      const client = Binance({
        apiKey: dto.apiKey,
        apiSecret: dto.apiSecret,
      });

      // Fetch account info to verify
      await client.accountInfo();

      // 2. Encrypt the keys
      const encryptedApiKey = this.cryptoService.encrypt(dto.apiKey);
      const encryptedApiSecret = this.cryptoService.encrypt(dto.apiSecret);

      // 3. Save to database
      await this.accountRepository.upsert(userId, {
        provider: 'Binance',
        apiKey: encryptedApiKey,
        apiSecret: encryptedApiSecret,
        isActive: true,
      });

      return {
        success: true,
        message: 'Binance account connected successfully',
      };
    } catch (error: any) {
      this.logger.error('Failed to connect to Binance', error);
      if (error.code === -2014 || error.code === -2015) {
        throw new BadRequestException(
          'Invalid Binance API Key or Secret. Ensure IP restrictions are configured or relaxed for testing.',
        );
      }
      throw new BadRequestException('Failed to verify Binance credentials');
    }
  }

  async disconnect(userId: number) {
    await this.accountRepository.delete(userId);
    return { success: true, message: 'Binance account disconnected' };
  }

  async getStatus(userId: number) {
    const account = await this.accountRepository.findByUserId(userId);
    return {
      isConnected: !!account && account.isActive,
      provider: account?.provider || null,
    };
  }

  async getAccountBalance(userId: number) {
    const account = await this.accountRepository.findByUserId(userId);
    if (
      !account ||
      !account.isActive ||
      !account.apiKey ||
      !account.apiSecret
    ) {
      throw new BadRequestException('Binance account not connected');
    }

    try {
      const apiKey = this.cryptoService.decrypt(account.apiKey);
      const apiSecret = this.cryptoService.decrypt(account.apiSecret);

      const client = Binance({ apiKey, apiSecret });
      const accountInfo = await client.accountInfo();

      // Filter out empty balances
      const balances = accountInfo.balances
        .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        .map((b) => ({
          asset: b.asset,
          free: parseFloat(b.free),
          locked: parseFloat(b.locked),
          total: parseFloat(b.free) + parseFloat(b.locked),
        }));

      return {
        canTrade: accountInfo.canTrade,
        balances,
      };
    } catch (error) {
      this.logger.error('Failed to fetch Binance account balance', error);
      throw new InternalServerErrorException('Failed to fetch account balance');
    }
  }

  async getPrices() {
    try {
      // Create an unauthenticated client for public data
      const client = Binance();
      const prices = await client.prices();
      // Only return a few major pairs to keep payload small for demo purposes
      const selectedPairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
      const filteredPrices = {};
      selectedPairs.forEach((pair) => {
        if (prices[pair]) filteredPrices[pair] = prices[pair];
      });
      return filteredPrices;
    } catch (error) {
      this.logger.error('Failed to fetch prices', error);
      throw new InternalServerErrorException('Failed to fetch prices');
    }
  }
}
