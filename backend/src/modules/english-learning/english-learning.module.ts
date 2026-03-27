import { Module } from '@nestjs/common';
import { EnglishLearningService } from './english-learning.service';
import { EnglishLearningController } from './english-learning.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [EnglishLearningController],
  providers: [EnglishLearningService],
  exports: [EnglishLearningService],
})
export class EnglishLearningModule {}
