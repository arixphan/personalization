import { Injectable, OnModuleInit } from '@nestjs/common';
import { AiTool, AiToolResult } from '../types/tool.types';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ToolSet } from 'ai';
import { PrismaService } from '../../prisma';
import {
  GetWalletSummaryTool,
  GetFinanceSummaryTool,
  SearchFinanceHistoryTool,
  GetTransactionsTool,
  GetSpendingStatsTool,
  CreateTransactionTool,
  DeleteTransactionTool,
} from '../tools/finance.tools';
import {
  GetTradingLogsTool,
  GetTradingStrategiesTool,
  CreateTradingLogTool,
  UpdateTradingLogTool,
} from '../tools/trading.tools';
import {
  GetProjectsTool,
  GetTicketsTool,
  CreateProjectTool,
  UpdateProjectTool,
  CreateTicketTool,
  UpdateTicketTool,
} from '../tools/project.tools';
import { MemoryService } from './memory.service';
import { RagService } from './rag.service';
import { TransactionService } from '../../finance/transaction.service';
import {
  SaveMemoryTool,
  GetRecentMemoriesTool,
  DeleteMemoryTool,
} from '../tools/memory.tools';

@Injectable()
export class ToolRegistryService implements OnModuleInit {
  private tools = new Map<string, AiTool>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly memory: MemoryService,
    private readonly rag: RagService,
    private readonly transactionService: TransactionService,
  ) {}

  onModuleInit() {
    this.registerTool(new GetWalletSummaryTool(this.prisma));
    this.registerTool(new GetFinanceSummaryTool(this.prisma));
    this.registerTool(new SearchFinanceHistoryTool(this.rag));
    this.registerTool(new GetTransactionsTool(this.prisma));
    this.registerTool(new GetSpendingStatsTool(this.prisma));
    this.registerTool(new CreateTransactionTool(this.transactionService));
    this.registerTool(new DeleteTransactionTool(this.transactionService));
    this.registerTool(new GetTradingLogsTool(this.prisma));
    this.registerTool(new GetTradingStrategiesTool(this.prisma));
    this.registerTool(new CreateTradingLogTool(this.prisma));
    this.registerTool(new UpdateTradingLogTool(this.prisma));
    this.registerTool(new GetProjectsTool(this.prisma));
    this.registerTool(new GetTicketsTool(this.prisma));
    this.registerTool(new CreateProjectTool(this.prisma));
    this.registerTool(new UpdateProjectTool(this.prisma));
    this.registerTool(new CreateTicketTool(this.prisma));
    this.registerTool(new UpdateTicketTool(this.prisma));
    this.registerTool(new SaveMemoryTool(this.memory));
    this.registerTool(new GetRecentMemoriesTool(this.memory));
    this.registerTool(new DeleteMemoryTool(this.memory));
  }

  registerTool(tool: AiTool) {
    this.tools.set(tool.name, tool);
  }

  getToolDefinitions() {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    }));
  }

  async executeTool(
    name: string,
    userId: number,
    input: any,
  ): Promise<AiToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return { success: false, error: `Tool ${name} not found` };
    }

    try {
      return await tool.execute(userId, input);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getTools() {
    return Array.from(this.tools.values());
  }

  getAisdkTools(userId: number): ToolSet {
    const tools: ToolSet = {};
    this.getTools().forEach((tool) => {
      tools[tool.name] = {
        description: tool.description,
        inputSchema: tool.inputSchema,
        execute: async (input: any) => {
          return await this.executeTool(tool.name, userId, input);
        },
      } as any;
    });
    return tools;
  }
}
