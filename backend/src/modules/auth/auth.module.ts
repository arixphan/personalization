import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/modules/user/user.module';
import { ShareModule } from 'src/modules/shared/share.module';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PermissionModule } from 'src/modules/permission/permission.module';

@Module({
  imports: [
    UserModule,
    ShareModule,
    PermissionModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
        },
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
