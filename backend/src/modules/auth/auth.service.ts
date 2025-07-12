import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from '@prisma/client';

import { PermissionService } from 'src/modules/permission/permission.service';
import { PasswordService } from 'src/modules/shared/password.service';
import { UserService } from 'src/modules/user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './dto/jwt-payload';
import { AuthenticationError } from 'src/exceptions/AuthenticationError';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  @Inject(CACHE_MANAGER) private cacheManager: Cache;

  async validateUser(
    username: string,
    password: string,
  ): Promise<(Omit<User, 'password'> & { permissions: string[] }) | null> {
    const user = await this.userService.findByUsername(username);
    const isPass = await this.passwordService.comparePasswords(
      password,
      user?.password || '',
    );
    if (user && isPass) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      const permissions = await this.permissionService.getPermissionsByRoleId(
        user.roleId,
      );
      return { ...result, permissions: permissions || [] };
    }
    return null;
  }

  async login(user: Omit<User, 'password'> & { permissions: string[] }) {
    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
      roleId: user.roleId,
      permissions: user.permissions,
    };

    const refresh_token = this.jwtService.sign(payload);
    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
    });

    await this.cacheManager.set(
      user.id.toString(),
      refresh_token,
      this.configService.get<number>('CACHE_TTL'),
    );

    return {
      access_token,
      refresh_token,
    };
  }

  async logout(userId: number): Promise<void> {
    await this.cacheManager.del(userId.toString());
  }

  async refreshToken(clientRefreshToken: string): Promise<string> {
    const userId = this.jwtService.decode<JwtPayload>(clientRefreshToken)?.sub;

    const refresh_token = await this.cacheManager.get<string>(
      userId.toString(),
    );

    if (!refresh_token || refresh_token !== clientRefreshToken) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    const payload = this.jwtService.decode(refresh_token);

    if (!payload) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const { iat, exp, ...userInfo } = payload;

    const newAccessToken = this.jwtService.sign(userInfo, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
    });

    return newAccessToken;
  }
}
