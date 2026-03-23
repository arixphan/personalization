import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatar: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: AppConfigService) {
    super({
      clientID: configService.auth.google.clientId || 'MISSING_CLIENT_ID',
      clientSecret: configService.auth.google.clientSecret || 'MISSING_CLIENT_SECRET',
      callbackURL: `${configService.app.backendUrl}/auth/google/callback`,
      scope: ['openid', 'email', 'profile'],
    });
  }

  // Ensures users can pick their account in shared-browser scenarios
  authorizationParams(): Record<string, string> {
    return { prompt: 'select_account' };
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: {
      id: string;
      displayName: string;
      emails: { value: string; verified: boolean }[];
      photos: { value: string }[];
    },
    done: VerifyCallback,
  ): Promise<void> {
    const googleProfile: GoogleProfile = {
      googleId: profile.id,
      email: profile.emails[0]?.value,
      name: profile.displayName,
      avatar: profile.photos[0]?.value,
    };
    done(null, googleProfile);
  }
}
