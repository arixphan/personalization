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
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AUTH_CONFIG } from '@personalization/shared';

import { Public } from '../../decorators/public.decorator';
import { AuthService } from './auth.service';
import { JwtTokenRequest, LoginRequest } from './auth.types';
import { GoogleProfile } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

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
      httpOnly: true, // Ensures the cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Helps prevent CSRF attacks
      path: AUTH_CONFIG.PATHS.REFRESH_TOKEN,
      maxAge: this.configService.get<number>('CACHE_TTL'),
    });

    return res.status(HttpStatus.OK).json({ access_token });
  }

  @Post('logout')
  async logout(
    @Request() req: JwtTokenRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.sub);

    res.clearCookie(AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN, {
      path: AUTH_CONFIG.PATHS.REFRESH_TOKEN,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(HttpStatus.OK).json({ message: 'Logout successfully' });
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
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'No refresh token provided' });
    }

    const newAccessToken = await this.authService.refreshToken(refreshToken);

    if (!newAccessToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid refresh token' });
    }

    return res.status(HttpStatus.OK).json({ access_token: newAccessToken });
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
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
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
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Missing exchange code' });
    }

    const tokens = await this.authService.consumeExchangeCode(body.code);

    if (!tokens) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid or expired exchange code' });
    }

    // Set both tokens as HttpOnly cookies — no tokens in the response body
    res.cookie(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN, tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: AUTH_CONFIG.EXPIRATION.ACCESS_TOKEN_COOKIE_MAX_AGE * 1000,
    });

    res.cookie(AUTH_CONFIG.COOKIE_NAMES.REFRESH_TOKEN, tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: AUTH_CONFIG.PATHS.REFRESH_TOKEN,
      maxAge: this.configService.get<number>('CACHE_TTL'),
    });

    return res.status(HttpStatus.OK).json({ success: true });
  }
}
