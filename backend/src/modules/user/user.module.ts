import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { ShareModule } from 'src/modules/shared/share.module';

@Module({
  imports: [PrismaModule, ShareModule],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
