import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AiSettingsService, AiSettingsDto } from './services/ai-settings.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('ai/settings')
@UseGuards(JwtAuthGuard)
export class AiSettingsController {
  constructor(private readonly aiSettingsService: AiSettingsService) {}

  @Get()
  async getSettings(@Request() req) {
    const settings = await this.aiSettingsService.getSettings(req.user.id);
    if (settings && settings.apiKey) {
      settings.apiKey = '••••••••••••••••';
    }
    return settings;
  }

  @Post()
  async updateSettings(@Request() req, @Body() dto: AiSettingsDto) {
    return this.aiSettingsService.updateSettings(req.user.id, dto);
  }
}
