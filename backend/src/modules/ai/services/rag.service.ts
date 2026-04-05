import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { embed, embedMany } from 'ai';
import { AiSettingsService } from './ai-settings.service';
import { ModelFactoryService } from './model-factory.service';

@Injectable()
export class RagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiSettings: AiSettingsService,
    private readonly modelFactory: ModelFactoryService,
  ) {}

  async embedText(text: string, userId: number): Promise<number[]> {
    const settings = await this.aiSettings.getSettings(userId, true);
    if (!settings || !settings.apiKey || !settings.provider) {
      throw new Error('AI Assistant is not configured. Please go to /ai to set up your provider and API key.');
    }

    const model = this.modelFactory.createEmbeddingModel(settings.provider, settings.apiKey);

    const { embedding } = await embed({
      model,
      value: text,
    });
    return embedding;
  }

  async saveEmbedding(data: {
    userId: number;
    domain: string;
    entityType: string;
    entityId: number;
    content: string;
    embedding: number[];
    metadata?: any;
  }) {
    const {
      userId,
      domain,
      entityType,
      entityId,
      content,
      embedding,
      metadata,
    } = data;

    const vectorString = `[${embedding.join(',')}]`;

    await this.prisma.$executeRaw`
      INSERT INTO "AiEmbedding" ("userId", "domain", "entityType", "entityId", "content", "embedding", "metadata", "updatedAt")
      VALUES (${userId}, ${domain}, ${entityType}, ${entityId}, ${content}, ${vectorString}::vector, ${metadata || {}}, NOW())
      ON CONFLICT ("entityType", "entityId") DO UPDATE SET
      "content" = EXCLUDED."content",
      "embedding" = EXCLUDED."embedding",
      "metadata" = EXCLUDED."metadata",
      "updatedAt" = NOW()
    `;
  }

  async deleteEmbedding(entityType: string, entityId: number) {
    await this.prisma.$executeRaw`
      DELETE FROM "AiEmbedding"
      WHERE "entityType" = ${entityType} AND "entityId" = ${entityId}
    `;
  }

  async retrieveContext(
    userId: number,
    queryEmbedding: number[],
    domain?: string,
    limit = 5,
  ) {
    const vectorString = `[${queryEmbedding.join(',')}]`;

    // We use raw query because of vector distance operator <=>
    const results: any[] = domain
      ? await this.prisma.$queryRaw`
          SELECT content, 1 - (embedding <=> ${vectorString}::vector) as similarity
          FROM "AiEmbedding"
          WHERE "userId" = ${userId} AND "domain" = ${domain}
          AND 1 - (embedding <=> ${vectorString}::vector) > 0.4
          ORDER BY similarity DESC
          LIMIT ${limit}
        `
      : await this.prisma.$queryRaw`
          SELECT content, 1 - (embedding <=> ${vectorString}::vector) as similarity
          FROM "AiEmbedding"
          WHERE "userId" = ${userId}
          AND 1 - (embedding <=> ${vectorString}::vector) > 0.4
          ORDER BY similarity DESC
          LIMIT ${limit}
        `;

    return results.map((r) => r.content);
  }
}
