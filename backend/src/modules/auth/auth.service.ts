import { Cache } from 'cache-manager';
import { PermissionService } from 'src/modules/permission/permission.service';
import { PasswordService } from 'src/modules/shared/password.service';
import { UserService } from 'src/modules/user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import { JwtPayload } from './dto/jwt-payload';

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

  getExpiresIn(): number {
    const expiresIn = this.configService.get<number>(
      'JWT_ACCESS_EXPIRATION_TIME',
    );
    if (!expiresIn) {
      throw new Error(
        'JWT_ACCESS_EXPIRATION_TIME is not defined in the environment variables',
      );
    }
    return expiresIn;
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<{
    user: (Omit<User, 'password'> & { permissions: string[] }) | null;
    error?: string;
  }> {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      return {
        user: null,
        error: 'Username or password is incorrect',
      };
    }

    const isPass = await this.passwordService.comparePasswords(
      password,
      user?.password || '',
    );

    if (!isPass) {
      return {
        user: null,
        error: 'Username or password is incorrect',
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: storedPassword, ...result } = user;
    const permissions = await this.permissionService.getPermissionsByRoleId(
      user.roleId,
    );
    return { user: { ...result, permissions: permissions || [] } };
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
      expiresIn: this.getExpiresIn(),
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
    try {
      const userId =
        this.jwtService.verify<JwtPayload>(clientRefreshToken)?.sub;

      const refresh_token = await this.cacheManager.get<string>(
        userId.toString(),
      );

      if (!refresh_token || refresh_token !== clientRefreshToken) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const payload = this.jwtService.decode(refresh_token);

      if (!payload) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { iat, exp, ...userInfo } = payload;

      const newAccessToken = this.jwtService.sign(userInfo, {
        expiresIn: this.getExpiresIn(),
      });

      return newAccessToken;
    } catch {
      throw new UnauthorizedException('Token is expired');
    }
  }
}
