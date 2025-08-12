import { Response } from 'express';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import {
  Controller,
  Request,
  Post,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Public } from '../../decorators/public.decorator';
import { AuthService } from './auth.service';
import { JwtTokenRequest, LoginRequest } from './auth.types';

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

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true, // Ensures the cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Helps prevent CSRF attacks
      path: 'api/auth/refresh',
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

    res.clearCookie('refresh_token', {
      path: 'api/auth/refresh',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(HttpStatus.OK).json({ message: 'Logout successfully' });
  }

  @Public()
  @Post('/refresh')
  async refresh(
    @Request() req: JwtTokenRequest & { cookies: { refresh_token?: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];

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
}
