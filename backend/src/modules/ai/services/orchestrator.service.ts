import { Injectable } from '@nestjs/common';
import { streamText, ToolSet, stepCountIs, convertToModelMessages } from 'ai';
import { RagService } from './rag.service';
import { MemoryService } from './memory.service';
import { AiSettingsService } from './ai-settings.service';
import { ModelFactoryService } from './model-factory.service';
import { ToolRegistryService } from './tool-registry.service';

@Injectable()
export class OrchestratorService {
  constructor(
    private readonly rag: RagService,
    private readonly toolRegistry: ToolRegistryService,
    private readonly memory: MemoryService,
    private readonly aiSettings: AiSettingsService,
    private readonly modelFactory: ModelFactoryService,
  ) {}

  async chatStream(
    userId: number,
    messages: any[],
    domain?: string,
  ): Promise<any> {
    try {
      // 0. Fetch user AI settings
      const settings = await this.aiSettings.getSettings(userId, true);
      
      if (!settings || !settings.apiKey || !settings.provider) {
        throw new Error('AI Assistant is not configured. Please go to /ai to set up your provider and API key.');
      }

      // 0.5. Extract user query for context
      const userQuery = this.extractMessage({ messages, ...domain ? { domain } : {} });
      
      // 0.6. Create model using factory
      const model = this.modelFactory.createModel(
        settings.provider,
        settings.apiKey,
        settings.model || undefined,
      );

      // 1. Embed query and retrieve context
      const queryEmbedding = await this.rag.embedText(
        userQuery || 'finance summary',
      );
      const contextChunks = await this.rag.retrieveContext(
        userId,
        queryEmbedding,
        domain,
        15,
      );

      // 1.5. Fetch recent user memories
      const memories = await this.memory.getRecentMemories(userId, 20);
      const memoryContext = memories
        .map((m) => `${m.key}: ${m.value}`)
        .join('\n');

      // 2. Register tools
      const tools = this.toolRegistry.getAisdkTools(userId);

      // 3. Stream response
      const systemPromptText = `You are a helpful AI assistant in the Personalization platform.
      Current context from user's data:
      ${contextChunks.join('\n\n')}
      
      User's saved memories/preferences (most recent):
      ${memoryContext || 'No personal preferences saved yet.'}
      
      Help the user manage their data, finance, trading, and productivity. Be concise and professional.
      
      MEMORY GUIDELINES:
      - When the user shares personal preferences, goals, or important context (e.g., "I use VND", "I have a cat"), ALWAYS use 'save_memory' to persist it.
      - Prefer updating existing keys (upsert) over creating duplicate/redundant entries.
      
      FINANCE GUIDELINES:
      - For precise math, sums, or date-based filtering (e.g., "spending this month"), ALWAYS use 'get_spending_stats' or 'get_transactions'.
      - Use 'search_finance_history' ONLY for fuzzy semantic searches where exact dates/numbers don't matter.
      - Never guess financial totals; always use a tool.`;

      const result = streamText({
        model: model,
        system: systemPromptText,
        messages: await convertToModelMessages(messages),
        tools: tools,
        stopWhen: stepCountIs(10), // Allow up to 10 steps for tool calls
      });

      return result;
    } catch (error: any) {
      console.error(`[OrchestratorService] Error in chatStream:`, error);
      throw error;
    }
  }

  /**
   * Identifies the primary user message from various potential payload formats.
   */
  public extractMessage(payload: Record<string, any>): string | null {
    const { message, text, messages } = payload;

    if (message || text) {
      return this.normalizeMessage(message ?? text);
    }

    if (Array.isArray(messages) && messages.length > 0) {
      const target = this.findLastUserMessage(messages) ?? messages.at(-1);
      return this.normalizeMessage(this.extractMessageContent(target));
    }

    return null;
  }

  private findLastUserMessage(messages: any[]): any | undefined {
    return [...messages]
      .reverse()
      .find((m) => ['user'].includes(m.role?.toLowerCase() ?? m.type?.toLowerCase()));
  }

  private extractMessageContent(msg: any): string {
    if (Array.isArray(msg?.parts)) {
      const fromParts = msg.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('\n');

      if (fromParts) return fromParts;
    }

    return msg?.content ?? msg?.text ?? msg?.message ?? '';
  }

  private normalizeMessage(message: unknown): string | null {
    if (!message) return null;
    return typeof message === 'object' ? JSON.stringify(message) : String(message);
  }
}
