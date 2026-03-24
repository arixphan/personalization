import { Module } from '@nestjs/common';
import { MindMapService } from './mind-maps.service';
import { MindMapAiService } from './mind-map-ai.service';
import { MindMapController } from './mind-maps.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [MindMapController],
  providers: [MindMapService, MindMapAiService],
  exports: [MindMapService, MindMapAiService],
})
export class MindMapModule {}
