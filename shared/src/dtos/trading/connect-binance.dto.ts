import { z } from 'zod';

export const ConnectBinanceSchema = z.object({
  apiKey: z.string().min(1, 'API Key is required'),
  apiSecret: z.string().min(1, 'API Secret is required'),
});

export type ConnectBinanceDto = z.infer<typeof ConnectBinanceSchema>;
