import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

import { AppController } from './app.controller';
import { UserModule } from './modules/user/user.module';
import { AppService } from './app.service';
import { ShareModule } from './modules/shared/share.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { PermissionModule } from './modules/permission/permission.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionGuard } from './guards/permission.guard';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true, // Makes cache available globally
    }),
    ConfigModule.forRoot({
      isGlobal: true, // makes config available globally
      envFilePath: '.env', // default, can be omitted
    }),
    UserModule,
    AuthModule,
    PrismaModule,
    ShareModule,
    PermissionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
