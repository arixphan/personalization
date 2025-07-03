import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  exports: [PermissionService],
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}
