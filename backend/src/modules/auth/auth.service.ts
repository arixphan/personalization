import { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import { PermissionService } from 'src/modules/permission/permission.service';
import { PasswordService } from 'src/modules/shared/password.service';
import { UserService } from 'src/modules/user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { USER_ROLE } from '@personalization/shared';

import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

import { GoogleProfile } from './strategies/google.strategy';
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
    const expiresIn = this.getExpiresIn();
    const access_token = this.jwtService.sign(payload, {
      expiresIn,
    });

    console.log(`[AuthService] Generated tokens for user ${user.id}:`, {
      expiresIn,
      payload,
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

  /**
   * OAuth User Resolution:
   * 1. Look up by googleId (returning user)
   * 2. Look up by email (existing local account — DO NOT auto-link)
   * 3. Create new account
   */
  async loginWithGoogle(
    profile: GoogleProfile,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // Step 1: Returning OAuth user
    const existingByGoogleId = await this.userService.findByGoogleId(
      profile.googleId,
    );
    if (existingByGoogleId) {
      const permissions = await this.permissionService.getPermissionsByRoleId(
        existingByGoogleId.roleId,
      );
      return this.login({
        ...existingByGoogleId,
        permissions: permissions || [],
      });
    }

    // Step 2: Existing local account with the same email — block silent linking
    if (profile.email) {
      const existingByEmail = await this.userService.findByEmail(profile.email);
      if (existingByEmail) {
        throw new ConflictException(
          'An account with this email already exists. Please sign in with your username and password to link your Google account.',
        );
      }
    }

    // Step 3: New user — create account
    const newUser = await this.userService.createOAuthUser({
      username: `google_${profile.googleId}`,
      googleId: profile.googleId,
      name: profile.name,
      avatar: profile.avatar,
      roleId: USER_ROLE.USER,
      email: profile.email,
    });

    const permissions = await this.permissionService.getPermissionsByRoleId(
      newUser.roleId,
    );
    return this.login({ ...newUser, permissions: permissions || [] });
  }

  /**
   * Generate a short-lived, single-use opaque code tied to session tokens.
   * The code is stored in cache with a 60-second TTL.
   */
  async generateExchangeCode(
    access_token: string,
    refresh_token: string,
  ): Promise<string> {
    const code = randomUUID();
    await this.cacheManager.set(
      `oauth_code:${code}`,
      { access_token, refresh_token },
      60 * 1000, // 60 seconds TTL
    );
    return code;
  }

  /**
   * Consume an exchange code — deletes it immediately (single-use).
   */
  async consumeExchangeCode(
    code: string,
  ): Promise<{ access_token: string; refresh_token: string } | null> {
    const key = `oauth_code:${code}`;
    const tokens = await this.cacheManager.get<{
      access_token: string;
      refresh_token: string;
    }>(key);
    if (!tokens) return null;
    await this.cacheManager.del(key);
    return tokens;
  }
}
