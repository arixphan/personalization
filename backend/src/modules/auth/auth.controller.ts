import { Response } from 'express';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import {
  Controller,
  Request,
  Post,
  Get,
  Body,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_CONFIG } from '@personalization/shared';
import { AppConfigService } from '../config';

import { Public } from '../../decorators/public.decorator';
import { AuthService } from './auth.service';
import { JwtTokenRequest, LoginRequest } from './auth.types';
import { GoogleProfile } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: AppConfigService,
  ) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(
    @Request() req: LoginRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token } = await this.authService.login(
      req.user,
    );

    res.cookie(AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN, refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: this.authService.getRefreshExpiresInMs(),
    });

    res.status(HttpStatus.OK);
    return { access_token };
  }

  @Post('logout')
  async logout(
    @Request() req: JwtTokenRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.sub);

    res.clearCookie(AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(HttpStatus.OK);
    return { message: 'Logout successfully' };
  }

  @Public()
  @Post('/refresh')
  async refresh(
    @Request()
    req: JwtTokenRequest & {
      cookies: { [key: string]: string | undefined };
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies[AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN];

    if (!refreshToken) {
      console.error('[AuthController/refresh] No refresh token cookie found');
      res.status(HttpStatus.UNAUTHORIZED);
      return { message: 'No refresh token provided' };
    }

    try {
      const newAccessToken = await this.authService.refreshToken(refreshToken);

      if (!newAccessToken) {
        console.error('[AuthController/refresh] authService.refreshToken returned null');
        res.status(HttpStatus.UNAUTHORIZED);
        return { message: 'Invalid refresh token' };
      }

      console.log('[AuthController/refresh] Successfully refreshed token');
      res.status(HttpStatus.OK);
      return { access_token: newAccessToken };
    } catch (error: any) {
      console.error('[AuthController/refresh] Error during token refresh:', error.message);
      res.status(HttpStatus.UNAUTHORIZED);
      return { message: error.message || 'Token is expired' };
    }
  }

  // ---- Google OAuth ----

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport redirects to Google automatically — no body needed.
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Request() req: { user: GoogleProfile },
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.app.frontendUrl;
    try {
      const tokens = await this.authService.loginWithGoogle(req.user);
      const code = await this.authService.generateExchangeCode(
        tokens.access_token,
        tokens.refresh_token,
      );
      return res.redirect(`${frontendUrl}/auth-callback?code=${code}`);
    } catch (error) {
      const message =
        error instanceof Error ? encodeURIComponent(error.message) : 'error';
      return res.redirect(`${frontendUrl}/auth-callback?error=${message}`);
    }
  }

  @Public()
  @Post('exchange')
  async exchangeCode(
    @Body() body: { code: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body?.code) {
      res.status(HttpStatus.BAD_REQUEST);
      return { message: 'Missing exchange code' };
    }

    const tokens = await this.authService.consumeExchangeCode(body.code);

    if (!tokens) {
      res.status(HttpStatus.UNAUTHORIZED);
      return { message: 'Invalid or expired exchange code' };
    }

    // Set both tokens as HttpOnly cookies and return them in the body for the frontend server action to forward
    res.cookie(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN, tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: this.authService.getAccessExpiresInMs()
    });

    res.cookie(AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN, tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: this.authService.getRefreshExpiresInMs(),
    });

    res.status(HttpStatus.OK);
    return {
      success: true,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    };
  }
}
