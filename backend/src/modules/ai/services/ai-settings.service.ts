import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from './encryption.service';

export interface AiSettingsDto {
  provider: string;
  apiKey?: string;
  model?: string;
}

@Injectable()
export class AiSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService
  ) {}

  async getSettings(userId: number, decrypt = false) {
    const settings = await this.prisma.userAiSettings.findUnique({
      where: { userId },
    });

    if (!settings) return null;

    if (decrypt && settings.apiKey) {
      try {
        settings.apiKey = this.encryption.decrypt(settings.apiKey);
      } catch (e) {
        console.error('Failed to decrypt API key', e);
      }
    }

    return settings;
  }

  async updateSettings(userId: number, dto: AiSettingsDto) {
    const data = { ...dto };
    if (data.apiKey) {
      data.apiKey = this.encryption.encrypt(data.apiKey);
    }

    return this.prisma.userAiSettings.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });
  }
}
