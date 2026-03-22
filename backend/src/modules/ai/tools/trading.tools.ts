import { z } from 'zod';
import { PrismaService } from '../../prisma';
import { AiTool, AiToolResult } from '../types/tool.types';

export class GetTradingLogsTool implements AiTool {
  name = 'get_trading_logs';
  description = 'Retrieves trading logs for a specific date range.';
  inputSchema = z.object({
    daysBack: z.number().optional().default(7),
  });
  requiresConfirmation = false;

  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: number,
    input: { daysBack: number },
  ): Promise<AiToolResult> {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - input.daysBack);

    const logs = await this.prisma.tradingLog.findMany({
      where: { userId, date: { gte: dateLimit } },
      orderBy: { date: 'desc' },
    });

    return {
      success: true,
      data: logs.map((l) => ({
        date: l.date,
        sentiment: l.sentiment,
        content: l.content,
      })),
    };
  }
}

export class GetTradingStrategiesTool implements AiTool {
  name = 'get_strategies';
  description = 'Returns all active trading strategies.';
  inputSchema = z.object({});
  requiresConfirmation = false;

  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: number): Promise<AiToolResult> {
    const strategies = await this.prisma.strategy.findMany({
      where: { userId, isActive: true },
    });

    return {
      success: true,
      data: strategies.map((s) => ({
        title: s.title,
        description: s.description,
        tags: s.tags,
      })),
    };
  }
}

export class CreateTradingLogTool implements AiTool {
  name = 'create_trading_log';
  description = 'Creates a new trading log/journal entry.';
  inputSchema = z.object({
    content: z.string().describe('The content of the trading log (Markdown format recommended)'),
    sentiment: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']).optional().default('NEUTRAL'),
    date: z.string().optional().describe('ISO-8601 date string. Defaults to now.'),
  });
  requiresConfirmation = false;

  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: number,
    input: { content: string; sentiment?: any; date?: string },
  ): Promise<AiToolResult> {
    const log = await this.prisma.tradingLog.create({
      data: {
        userId,
        content: input.content,
        sentiment: input.sentiment,
        date: input.date ? new Date(input.date) : new Date(),
      },
    });

    return {
      success: true,
      data: { id: log.id, date: log.date },
    };
  }
}

export class UpdateTradingLogTool implements AiTool {
  name = 'update_trading_log';
  description = 'Updates an existing trading log entry.';
  inputSchema = z.object({
    logId: z.number().describe('The ID of the trading log entry'),
    content: z.string().optional(),
    sentiment: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']).optional(),
  });
  requiresConfirmation = false;

  constructor(private readonly prisma: PrismaService) {}

  async execute(
    userId: number,
    input: { logId: number; content?: string; sentiment?: any },
  ): Promise<AiToolResult> {
    const log = await this.prisma.tradingLog.update({
      where: { id: input.logId, userId },
      data: {
        content: input.content,
        sentiment: input.sentiment,
      },
    });

    return {
      success: true,
      data: { id: log.id, date: log.date, sentiment: log.sentiment },
    };
  }
}
