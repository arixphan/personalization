import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { StrategyRepository } from './strategy.repository';
import {
  CreateStrategyDto,
  UpdateStrategyDto,
  ReorderStrategiesDto,
} from '@personalization/shared';

@Injectable()
export class StrategyService {
  private readonly logger = new Logger(StrategyService.name);

  constructor(private readonly strategyRepository: StrategyRepository) {}

  async create(dto: CreateStrategyDto, userId: number) {
    try {
      const count = await this.strategyRepository.count(userId);
      return await this.strategyRepository.create({
        ...dto,
        userId,
        position: count,
      });
    } catch (error) {
      this.logger.error('Failed to create strategy', error);
      throw new InternalServerErrorException('Failed to create strategy');
    }
  }

  async findAll(userId: number) {
    return this.strategyRepository.findMany(userId);
  }

  async findOne(id: number, userId: number) {
    const strategy = await this.strategyRepository.findById(id);
    if (!strategy || strategy.userId !== userId) {
      throw new NotFoundException(`Strategy with ID ${id} not found`);
    }
    return strategy;
  }

  async update(id: number, dto: UpdateStrategyDto, userId: number) {
    await this.findOne(id, userId);
    try {
      return await this.strategyRepository.update(id, dto);
    } catch (error) {
      this.logger.error(`Failed to update strategy ${id}`, error);
      throw new InternalServerErrorException('Failed to update strategy');
    }
  }

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);
    try {
      return await this.strategyRepository.delete(id);
    } catch (error) {
      this.logger.error(`Failed to delete strategy ${id}`, error);
      throw new InternalServerErrorException('Failed to delete strategy');
    }
  }

  async reorder(dto: ReorderStrategiesDto, userId: number) {
    try {
      const updates = dto.ids.map((id, index) =>
        this.strategyRepository.updatePosition(id, index),
      );
      await Promise.all(updates);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to reorder strategies', error);
      throw new InternalServerErrorException('Failed to reorder strategies');
    }
  }
}
