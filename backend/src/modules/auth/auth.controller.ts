import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../decorators/public.decorator';
import { LocalAuthGuard } from 'src/guards/local-auth.guard';
import { LoginRequest } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() req: LoginRequest) {
    return this.authService.login(req.user);
  }

  @Post('auth/logout')
  logout(@Request() req) {
    return req.logout();
  }
}
