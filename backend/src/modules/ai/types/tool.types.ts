import { ZodSchema } from 'zod';

export interface AiToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AiTool<TInput = any> {
  name: string;
  description: string;
  inputSchema: ZodSchema<TInput>;
  requiresConfirmation: boolean;
  execute(userId: number, input: TInput): Promise<AiToolResult>;
}
