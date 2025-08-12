import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> & { permissions: string[] }> {
    const { user, error } = await this.authService.validateUser(
      username,
      password,
    );

    if (!user) {
      throw new UnauthorizedException(error || 'Unauthenticated');
    }

    return user;
  }
}
