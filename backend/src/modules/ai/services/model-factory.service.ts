import { Injectable } from '@nestjs/common';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModel, EmbeddingModel } from 'ai';

@Injectable()
export class ModelFactoryService {
  /**
   * Creates a standardized AI model instance based on the provider and settings.
   */
  createModel(provider: string, apiKey: string, modelName?: string): LanguageModel {

    if (!modelName) {
      throw new Error('Model name is required');
    }

    if (provider === 'openai') {
      const openaiAI = createOpenAI({
        apiKey,
      });
      return openaiAI(modelName);
    }

    if (provider === 'google') {
      const googleAI = createGoogleGenerativeAI({
        apiKey,
      });
      return googleAI(modelName);
    }

    throw new Error(`AI Provider "${provider}" is not supported yet.`);
  }

  /**
   * Creates an embedding model instance.
   */
  createEmbeddingModel(provider: string, apiKey: string): EmbeddingModel {
    if (provider === 'openai') {
      const openaiAI = createOpenAI({ apiKey });
      return openaiAI.embedding('text-embedding-3-small');
    }

    if (provider === 'google') {
      const googleAI = createGoogleGenerativeAI({ apiKey });
      return googleAI.embedding('gemini-embedding-001');
    }

    throw new Error(`AI Provider "${provider}" is not supported for embeddings.`);
  }
}
