import { Module } from '@nestjs/common';
import { MindMapService } from './mind-maps.service';
import { MindMapAiService } from './mind-map-ai.service';
import { MindMapController } from './mind-maps.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { MindMapGateway } from './mind-maps.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, AiModule, JwtModule.register({})],
  controllers: [MindMapController],
  providers: [MindMapService, MindMapAiService, MindMapGateway],
  exports: [MindMapService, MindMapAiService],
})
export class MindMapModule {}
