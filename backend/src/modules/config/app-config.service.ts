import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) { }

  get auth() {
    return {
      jwtSecret: this.configService.getOrThrow<string>('auth.jwtSecret'),
      accessExpiration: this.configService.getOrThrow<number>('auth.accessExpiration'),
      refreshExpiration: this.configService.getOrThrow<number>('auth.refreshExpiration'),
      google: {
        clientId: this.configService.get<string>('auth.google.clientId'),
        clientSecret: this.configService.get<string>('auth.google.clientSecret'),
      },
      encryptionKey: this.configService.getOrThrow<string>('auth.encryptionKey'),
      bcryptSaltRounds: this.configService.getOrThrow<number>('auth.bcryptSaltRounds'),
    };
  }

  get app() {
    return {
      nodeEnv: this.configService.getOrThrow<string>('app.nodeEnv'),
      port: this.configService.getOrThrow<number>('app.port'),
      backendUrl: this.configService.get<string>('app.backendUrl'),
      frontendUrl: this.configService.get<string>('app.frontendUrl'),
      isProduction: this.configService.getOrThrow<boolean>('app.isProduction'),
      isDevelopment: this.configService.getOrThrow<boolean>('app.isDevelopment'),
    };
  }

  get database() {
    return {
      url: this.configService.getOrThrow<string>('database.url'),
    };
  }

  get ai() {
    return {
      openaiApiKey: this.configService.get<string>('OPENAI_API_KEY'),
      googleGenerativeAiApiKey: this.configService.get<string>('GOOGLE_GENERATIVE_AI_API_KEY'),
    };
  }
}
