import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiSettingsService, ModelFactoryService } from '../ai/services';
import { CreateEnglishRecordDto } from './dtos/create-english-record.dto';
import { UpdateEnglishRecordDto } from './dtos/update-english-record.dto';
import { GenerateAiContentDto } from './dtos/generate-ai-content.dto';
import { CreateWritingDto } from './dtos/create-writing.dto';
import { generateText } from 'ai';

@Injectable()
export class EnglishLearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiSettings: AiSettingsService,
    private readonly modelFactory: ModelFactoryService,
  ) {}

  async getSettings(userId: number) {
    const mem = await this.prisma.userMemory.findUnique({
      where: { userId_key: { userId, key: 'ENGLISH_SETTINGS' } }
    });
    const defaultSettings = { masteryThreshold: 5, wrongOptionAction: 'DECREASE' };
    if (!mem) return defaultSettings;
    try {
      return { ...defaultSettings, ...JSON.parse(mem.value) };
    } catch {
      return defaultSettings;
    }
  }

  async updateSettings(userId: number, settings: { masteryThreshold?: number; wrongOptionAction?: 'RESET' | 'DECREASE' }) {
    const current = await this.getSettings(userId);
    const newSettings = { ...current, ...settings };
    await this.prisma.userMemory.upsert({
      where: { userId_key: { userId, key: 'ENGLISH_SETTINGS' } },
      update: { value: JSON.stringify(newSettings), source: 'english_settings' },
      create: { userId, key: 'ENGLISH_SETTINGS', value: JSON.stringify(newSettings), source: 'english_settings' }
    });
    return newSettings;
  }

  async findAll(userId: number, filters: { type?: string; search?: string, status?: string, page?: number, limit?: number }) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const settings = await this.getSettings(userId);
    const threshold = settings.masteryThreshold;

    let masteryFilter = {};
    if (filters.status === 'mastered') {
      masteryFilter = { masteryLevel: { gte: threshold } };
    } else if (filters.status === 'learning') {
      masteryFilter = { masteryLevel: { lt: threshold } };
    }

    const where = {
      userId,
      ...(filters.type ? { type: filters.type as any } : {}),
      ...(filters.search
        ? {
            OR: [
              { content: { contains: filters.search, mode: 'insensitive' as any } },
              { translation: { contains: filters.search, mode: 'insensitive' as any } },
              { tags: { has: filters.search } },
            ],
          }
        : {}),
      ...masteryFilter,
    };

    const total = await this.prisma.englishRecord.count({ where });
    const records = await this.prisma.englishRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return { data: records, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(userId: number, id: number) {
    const record = await this.prisma.englishRecord.findFirst({
      where: { id, userId },
    });
    if (!record) throw new NotFoundException('Record not found');
    return record;
  }

  async create(userId: number, dto: CreateEnglishRecordDto) {
    return this.prisma.englishRecord.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async update(userId: number, id: number, dto: UpdateEnglishRecordDto) {
    await this.findOne(userId, id);
    return this.prisma.englishRecord.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    return this.prisma.englishRecord.delete({
      where: { id },
    });
  }

  async getRandom(userId: number, type?: string, excludeIds?: string) {
    const settings = await this.getSettings(userId);
    const skipIds = excludeIds ? excludeIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id)) : [];
    
    // Filter condition:
    // - match userId
    // - match type if provided
    // - exclude skipIds from this session
    // - only include records that are not fully mastered (masteryLevel < threshold)
    const condition: any = {
      userId,
      ...(type ? { type: type as any } : {}),
      ...(skipIds.length > 0 ? { id: { notIn: skipIds } } : {}),
      masteryLevel: { lt: settings.masteryThreshold }
    };

    const count = await this.prisma.englishRecord.count({
      where: condition,
    });

    if (count === 0) return null;

    const skip = Math.floor(Math.random() * count);
    return this.prisma.englishRecord.findFirst({
      where: condition,
      skip,
    });
  }

  async getRandomBatch(userId: number, limit: number, excludeIds?: string) {
    const settings = await this.getSettings(userId);
    const skipIds = excludeIds ? excludeIds.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id)) : [];
    
    const condition: any = {
      userId,
      ...(skipIds.length > 0 ? { id: { notIn: skipIds } } : {}),
      masteryLevel: { lt: settings.masteryThreshold }
    };

    // Since we need random elements, and Postgres random sorting is slow for huge DBs but fine for small ones
    // Or we can just fetch all IDs and pick N random. Since it's personal app, this is very fast.
    const validRecords = await this.prisma.englishRecord.findMany({
      where: condition,
      select: { id: true }
    });

    if (validRecords.length === 0) return [];

    // Shuffle and take N
    const shuffled = validRecords.sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, limit).map(r => r.id);

    // Fetch full records for selected IDs
    const records = await this.prisma.englishRecord.findMany({
      where: { id: { in: selectedIds } }
    });

    // Return in shuffled order
    return records.sort(() => 0.5 - Math.random());
  }

  async generateAiContent(userId: number, dto: GenerateAiContentDto) {
    const settings = await this.aiSettings.getSettings(userId, true);
    if (!settings?.apiKey) {
      throw new Error('AI not configured');
    }

    const model = this.modelFactory.createModel(
      settings.provider,
      settings.apiKey,
      settings.model || undefined,
    );

    const prompt = `You are an English tutor helper. 
User is learning English and needs help with the following ${dto.type}: "${dto.content}".
Please provide a JSON with:
- definition: a clear and simple English definition.
- translation: the Vietnamese meaning of this ${dto.type}.
- example: a natural example sentence using this ${dto.type}.
- note: any grammar tips or usage warnings.

Return ONLY the JSON.`;

    const result = await generateText({
      model,
      prompt,
    });

    try {
      // Basic JSON cleaning if needed
      const jsonStr = result.text.match(/\{[\s\S]*\}/)?.[0] || result.text;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response', result.text);
      return {
        definition: '',
        translation: '',
        example: '',
        note: 'AI failed to generate structured content.',
      };
    }
  }

  // Writing Coach Methods

  async createWriting(userId: number, dto: CreateWritingDto) {
    const wordCount = dto.content.trim().split(/\s+/).length;
    const writing = await this.prisma.englishWriting.create({
      data: {
        ...dto,
        userId,
        wordCount,
      },
    });

    // Automatically trigger feedback generation
    this.generateCoachFeedback(writing.id, userId).catch(console.error);

    return writing;
  }

  async findAllWritings(userId: number) {
    return this.prisma.englishWriting.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        wordCount: true,
        createdAt: true,
        feedback: true, // we might want just the score in the list
      },
    });
  }

  async findWritingById(userId: number, id: number) {
    const writing = await this.prisma.englishWriting.findFirst({
      where: { id, userId },
    });
    if (!writing) throw new NotFoundException('Writing not found');
    return writing;
  }

  async generateCoachFeedback(writingId: number, userId: number) {
    const writing = await this.findWritingById(userId, writingId);
    
    // Check if we already have feedback
    // if (writing.feedback) return writing.feedback;

    const settings = await this.aiSettings.getSettings(userId, true);
    if (!settings?.apiKey) return null;

    const model = this.modelFactory.createModel(
      settings.provider,
      settings.apiKey,
      settings.model || undefined,
    );

    const prompt = `You are a professional English Writing Coach. 
Analyze the following text written by an English learner:
"${writing.content}"

Focus on:
1. Naturalness: Rephrase awkward, "translated" sounding sentences into idiomatic English.
2. Vocabulary Booster: Suggest 3-5 stronger word choices for weak parts of the text.
3. Learning Gems Extraction: Identifying 2-3 higher-level phrases or grammar rules used (or corrected) in the text that the user should save for later practice.
4. Grammar/Spelling: Correct any direct errors.

Provide a JSON object with:
- score: 0-100 based on naturalness and grammar.
- enhancedVersion: a completely rewritten, natural version of the text.
- corrections: array of { original: string, correction: string, reason: string } (reason in English).
- vocabulary: array of { original: string, suggestion: string, reason: string, definition: string, translation: string, example: string } (reason and definition in English, translation in Vietnamese).
- gems: array of { content: string, type: 'PHRASE' | 'GRAMMAR' | 'SENTENCE', definition: string, translation: string, example: string } (definition in English, translation in Vietnamese).
- tips: array of 2-3 specific learning tips in English.

IMPORTANT: All "translation" fields MUST be in Vietnamese. All "reason", "definition", and "tips" fields MUST be in English.

Return ONLY the JSON.`;

    const result = await generateText({
      model,
      prompt,
    });

    try {
      const jsonStr = result.text.match(/\{[\s\S]*\}/)?.[0] || result.text;
      const feedback = JSON.parse(jsonStr);

      return this.prisma.englishWriting.update({
        where: { id: writingId },
        data: { feedback },
      });
    } catch (e) {
      console.error('Failed to parse AI Coach response', result.text);
      return null;
    }
  }
}
