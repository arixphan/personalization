import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import {
  AuthModule,
  PermissionModule,
  PrismaModule,
  ProjectsModule,
  ShareModule,
  UserModule,
} from './modules';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true, // Makes cache available globally
    }),
    ConfigModule.forRoot({
      isGlobal: true, // makes config available globally
      envFilePath: '.env', // default, can be omitted
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 20,
        },
      ],
    }),
    UserModule,
    AuthModule,
    PrismaModule,
    ShareModule,
    PermissionModule,
    ProjectsModule,
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
