'use server';

import { ServerApiHandler } from '@/lib/server-api';

export async function getMarketAnalysis(input: {
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  date: string;
}) {
  const response = await ServerApiHandler.get(`/trading/analysis?interval=${input.interval}&date=${input.date}`);
  if (response.error) {
    if (response.error.includes('404')) {
      return null;
    }
    throw new Error(response.error);
  }
  return { data: response.data };
}

export async function generateMarketAnalysis(input: {
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  date: string;
}) {
  const response = await ServerApiHandler.post(`/trading/analysis/generate`, {
    interval: input.interval,
    date: input.date,
  });
  if (response.error) {
    throw new Error(response.error);
  }
  return { data: response.data };
}
