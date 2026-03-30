import { Injectable, Logger, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { AiSettingsService, ModelFactoryService } from '../ai/services';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';
import { MarketDataService, PriceDataPoint } from './market-data.service';
import { NewsService } from './news.service';

@Injectable()
export class MarketAnalysisService {
  private readonly logger = new Logger(MarketAnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiSettings: AiSettingsService,
    private readonly modelFactory: ModelFactoryService,
    private readonly marketData: MarketDataService,
    private readonly newsService: NewsService,
  ) {}

  async getAnalysis(userId: number, interval: string, date: Date) {
    const analysis = await this.prisma.marketAnalysis.findUnique({
      where: {
        userId_interval_date: {
          userId,
          interval,
          date,
        },
      },
    });

    if (!analysis) {
      throw new NotFoundException(`Analysis not found for ${interval} on ${date.toISOString().split('T')[0]}`);
    }

    return analysis;
  }

  async generateAnalysis(userId: number, interval: 'DAILY' | 'WEEKLY' | 'MONTHLY', dateStr: string) {
    const symbol = 'BTCUSDT';
    const date = new Date(dateStr); // For Daily it should be YYYY-MM-DD
    
    // Check AI Configuration
    const settings = await this.aiSettings.getSettings(userId, true);
    if (!settings || !settings.apiKey || !settings.provider) {
      throw new BadRequestException('AI Assistant is not configured. Please set it up in /ai/settings.');
    }

    const model = this.modelFactory.createModel(settings.provider, settings.apiKey, settings.model || undefined);

    // Prepare Prompt Context
    let promptContext = '';
    let snapshotData: PriceDataPoint[] = [];

    if (interval === 'DAILY') {
      const news = await this.newsService.getLatestNews('bitcoin,btc');
      snapshotData = await this.marketData.getMarketSnapshot(symbol, 'DAILY');
      
      const newsContext = news.map((n, i) => `${i + 1}. ${n.title} - ${n.contentSnippet}`).join('\n');
      const techContext = snapshotData.map((d) => `Time: ${new Date(d.time).toISOString()}, Price: ${d.close}, RSI: ${d.rsi?.toFixed(2)}`).join('\n');

      promptContext = `
        Today's News:\n${newsContext}\n\n
        Recent Technical Data (1hr candlesticks from Binance for ${symbol}):\n${techContext}
      `;
    } else {
      // Find historical context
      let historicalLimit = interval === 'WEEKLY' ? 7 : 30;
      const pastAnalyses = await this.prisma.marketAnalysis.findMany({
        where: { userId, interval: 'DAILY', date: { lte: date } },
        orderBy: { date: 'desc' },
        take: historicalLimit,
      });

      const pastContext = pastAnalyses.map(a => `Date: ${a.date.toISOString().split('T')[0]}, Sentiment: ${a.sentiment}\nSummary: ${a.content}`).join('\n\n');
      snapshotData = await this.marketData.getMarketSnapshot(symbol, interval);
      const techContext = snapshotData.map((d) => `Time: ${new Date(d.time).toISOString()}, Price: ${d.close}, RSI: ${d.rsi?.toFixed(2)}`).join('\n');

      promptContext = `
        Historical Daily Summaries for the Past Period:\n${pastContext || 'No past analyses found.'}\n\n
        Macro Technical Data (Binance for ${symbol}):\n${techContext}
      `;
    }

    // Call Model using generateObject
    const analysisSchema = z.object({
      analysisMarkdown: z.string().describe("A highly detailed markdown overview of the market context, factors affecting price, and tech indicators based exactly on the provided data."),
      sentiment: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]).describe("The aggregated market sentiment prediciton strictly based on the technicals and news provided."),
    });

    try {
      const { object } = await generateObject({
        model,
        schema: analysisSchema as any,
        prompt: `
          Act as an expert quantitative trader and cryptocurrency analyst.
          Analyze the following data to provide a ${interval} market overview for ${symbol}.
          Consider the news impacts alongside the RSI & Price Action. Write your analysis inside the markdown property, keeping headers and bullet lists clean for a dashboard.
          
          Data Context:
          ${promptContext}
        `,
      }) as { object: { analysisMarkdown: string; sentiment: string } };

      // Save to database
      const result = await this.prisma.marketAnalysis.upsert({
        where: {
          userId_interval_date: {
            userId,
            interval,
            date,
          },
        },
        create: {
          userId,
          interval,
          date,
          content: object.analysisMarkdown,
          sentiment: object.sentiment,
          priceData: snapshotData as any,
        },
        update: {
          content: object.analysisMarkdown,
          sentiment: object.sentiment,
          priceData: snapshotData as any,
        },
      });

      return result;
    } catch (error) {
      this.logger.error(`Error generating ${interval} analysis for userId ${userId}`, error);
      throw new InternalServerErrorException('Failed to generate AI Market Analysis');
    }
  }
}
