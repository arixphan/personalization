import { z } from 'zod';

export enum TradingLogSentiment {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  NEUTRAL = 'NEUTRAL',
}

export const CreateTradingLogSchema = z.object({
  content: z.string().min(1),
  date: z.string().datetime(),
  sentiment: z.nativeEnum(TradingLogSentiment).default(TradingLogSentiment.NEUTRAL),
});

export type CreateTradingLogDto = z.infer<typeof CreateTradingLogSchema>;
