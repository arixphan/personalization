import { Injectable } from '@nestjs/common';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';

@Injectable()
export class ModelFactoryService {
  /**
   * Creates a standardized AI model instance based on the provider and settings.
   */
  createModel(provider: string, apiKey: string, modelName?: string): LanguageModel {
    if (provider === 'openai') {
      const openaiAI = createOpenAI({
        apiKey,
      });
      return openaiAI(modelName || 'gpt-4o');
    }

    if (provider === 'google') {
      const googleAI = createGoogleGenerativeAI({
        apiKey,
      });
      return googleAI(modelName || 'gemini-1.5-flash-latest');
    }

    throw new Error(`AI Provider "${provider}" is not supported yet.`);
  }
}
