import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TradingLogRepository } from './trading-log.repository';
import { CreateTradingLogDto, UpdateTradingLogDto } from '@personalization/shared';

@Injectable()
export class TradingLogService {
  private readonly logger = new Logger(TradingLogService.name);

  constructor(private readonly tradingLogRepository: TradingLogRepository) {}

  async create(dto: CreateTradingLogDto, userId: number) {
    const date = new Date(dto.date);
    const existing = await this.tradingLogRepository.findByDate(userId, date);
    if (existing) {
      throw new ConflictException('A log entry for this date already exists');
    }
    try {
      return await this.tradingLogRepository.create({ ...dto, date, userId });
    } catch (error) {
      this.logger.error('Failed to create trading log', error);
      throw new InternalServerErrorException('Failed to create trading log');
    }
  }

  async findByMonth(userId: number, month: string) {
    // month format: YYYY-MM
    const [year, mon] = month.split('-').map(Number);
    return this.tradingLogRepository.findManyByMonth(userId, year, mon);
  }

  async findByWeek(userId: number, week: string) {
    // week format: YYYY-WNN (e.g. 2026-W12)
    const [year, wPart] = week.split('-');
    const weekNum = parseInt(wPart.replace('W', ''), 10);
    return this.tradingLogRepository.findManyByWeek(
      userId,
      parseInt(year, 10),
      weekNum,
    );
  }

  async findOne(id: number, userId: number) {
    const log = await this.tradingLogRepository.findById(id);
    if (!log || log.userId !== userId) {
      throw new NotFoundException(`Trading log with ID ${id} not found`);
    }
    return log;
  }

  async findByDate(userId: number, dateStr: string) {
    const date = new Date(dateStr);
    return this.tradingLogRepository.findByDate(userId, date);
  }

  async update(id: number, dto: UpdateTradingLogDto, userId: number) {
    await this.findOne(id, userId);
    try {
      return await this.tradingLogRepository.update(id, dto);
    } catch (error) {
      this.logger.error(`Failed to update trading log ${id}`, error);
      throw new InternalServerErrorException('Failed to update trading log');
    }
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    try {
      return await this.tradingLogRepository.delete(id);
    } catch (error) {
      this.logger.error(`Failed to delete trading log ${id}`, error);
      throw new InternalServerErrorException('Failed to delete trading log');
    }
  }
}
