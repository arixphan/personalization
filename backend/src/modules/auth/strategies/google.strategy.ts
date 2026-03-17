import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatar: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientID || !clientSecret) {
      console.warn(
        '⚠️  OAuth Warning: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing from .env. Google login will not work.',
      );
    }

    super({
      clientID: clientID || 'MISSING_CLIENT_ID',
      clientSecret: clientSecret || 'MISSING_CLIENT_SECRET',
      callbackURL: `${configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/auth/google/callback`,
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
