import { z } from 'zod';
import { TradingLogSentiment } from './create-trading-log.dto';

export const UpdateTradingLogSchema = z.object({
  content: z.string().min(1).optional(),
  sentiment: z.nativeEnum(TradingLogSentiment).optional(),
});

export type UpdateTradingLogDto = z.infer<typeof UpdateTradingLogSchema>;
