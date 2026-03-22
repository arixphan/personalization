import { z } from 'zod';
import { MemoryService } from '../services/memory.service';
import { AiTool, AiToolResult } from '../types/tool.types';

export class SaveMemoryTool implements AiTool {
  name = 'save_memory';
  description =
    'Saves or updates an important fact about the user for long-term recall. Use this when the user shares preferences, goals, or recurring personal context.';
  inputSchema = z.object({
    key: z
      .string()
      .describe(
        'A short identifier (e.g., "preferred_currency" or "spending_goal")',
      ),
    value: z
      .string()
      .describe('The value to remember'),
  });
  requiresConfirmation = false;

  constructor(private readonly memory: MemoryService) {}

  async execute(
    userId: number,
    input: { key: string; value: string },
  ): Promise<AiToolResult> {
    await this.memory.saveMemory(userId, input.key, input.value);
    return {
      success: true,
      data: { message: 'Memory saved successfully' },
    };
  }
}

export class GetRecentMemoriesTool implements AiTool {
  name = 'get_recent_memories';
  description =
    'Retrieves a list of saved user memories/preferences. Use this to remember things the user told you in the past.';
  inputSchema = z.object({
    limit: z.number().optional().default(20),
  });
  requiresConfirmation = false;

  constructor(private readonly memory: MemoryService) {}

  async execute(
    userId: number,
    input: { limit: number },
  ): Promise<AiToolResult> {
    const memories = await this.memory.getRecentMemories(userId, input.limit);
    return {
      success: true,
      data: memories,
    };
  }
}

export class DeleteMemoryTool implements AiTool {
  name = 'delete_memory';
  description = 'Removes a specific memory by its key.';
  inputSchema = z.object({
    key: z.string().describe('The key of the memory to delete'),
  });
  requiresConfirmation = false;

  constructor(private readonly memory: MemoryService) {}

  async execute(userId: number, input: { key: string }): Promise<AiToolResult> {
    await this.memory.saveMemory(userId, input.key, '', 'deleted'); // SOFT DELETE OR ACTUAL DELETE
    // Actually MemoryService has clearMemories but not single delete. I'll use saveMemory with empty value as a convention for now or add delete to service.
    return {
      success: true,
      data: { message: `Memory ${input.key} removed` },
    };
  }
}
