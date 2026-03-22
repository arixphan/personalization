import { Controller, Post, Get, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Response } from 'express';
import { OrchestratorService } from './services/orchestrator.service';
import { IngestionService } from './services/ingestion.service';
import { ToolRegistryService } from './services/tool-registry.service';
import { PrismaService } from '../prisma';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly orchestrator: OrchestratorService,
    private readonly ingestion: IngestionService,
    private readonly toolRegistry: ToolRegistryService,
    private readonly prisma: PrismaService,
  ) { }

  @Get('status')
  async getStatus(@Req() req: any) {
    const userId = req.user.id;
    const embeddingCount = await this.prisma.aiEmbedding.count({
      where: { userId },
    });
    const memoryCount = await this.prisma.userMemory.count({
      where: { userId },
    });
    const tools = this.toolRegistry.getTools().map((t) => ({
      name: t.name,
      description: t.description,
    }));

    return {
      success: true,
      stats: {
        embeddings: embeddingCount,
        memories: memoryCount,
      },
      tools,
      ready: !!process.env.OPENAI_API_KEY,
    };
  }

  @Post('ingest/finance')
  async ingestFinance(@Req() req: any) {
    const userId = req.user.id;
    await this.ingestion.ingestFinanceUser(userId);
    return {
      success: true,
      message: 'Finance data ingestion started/completed',
    };
  }

  @Post('chat')
  async chat(
    @Req() req: any,
    @Res() res: Response,
  ) {
    try {
      const userId = req?.user?.id;
      const body = req.body ?? {};
      const message = this.orchestrator.extractMessage(body);

      if (!userId || !message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const result = await this.orchestrator.chatStream(
        userId,
        body.messages ?? [{ role: 'user', content: message }],
        body.domain,
      );

      result.pipeUIMessageStreamToResponse(res);
    } catch (error: any) {
      console.error('[AiController] Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      } else {
        res.end();
      }
    }
  }
}
