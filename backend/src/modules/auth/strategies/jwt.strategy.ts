import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import { AUTH_CONFIG } from '@personalization/shared';
import { JwtPayload } from '../dto/jwt-payload';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          return req?.cookies?.[AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN] || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.auth.jwtSecret,
    });
  }

  validate(payload: JwtPayload) {
    return { ...payload, id: payload.sub };
  }
}
