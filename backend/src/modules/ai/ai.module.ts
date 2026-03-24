import { forwardRef, Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import {
  OrchestratorService,
  RagService,
  ToolRegistryService,
  IngestionService,
  MemoryService,
  EncryptionService,
  AiSettingsService,
  ModelFactoryService,
} from './services';
import { AiSettingsController } from './ai-settings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FinanceModule } from '../finance/finance.module';
import { FinanceEventListener } from './listeners/finance-event.listener';

@Module({
  imports: [PrismaModule, forwardRef(() => FinanceModule)],
  controllers: [AiController, AiSettingsController],
  providers: [
    OrchestratorService,
    RagService,
    ToolRegistryService,
    IngestionService,
    MemoryService,
    EncryptionService,
    AiSettingsService,
    FinanceEventListener,
    ModelFactoryService,
  ],
  exports: [OrchestratorService, RagService, IngestionService, ModelFactoryService, AiSettingsService],
})
export class AiModule {}
