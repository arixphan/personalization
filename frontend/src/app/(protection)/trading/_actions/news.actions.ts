"use server";

import { ServerApiHandler } from "@/lib/server-api";

export async function getMarketNews(currencies?: string) {
  const query = currencies ? `?currencies=${encodeURIComponent(currencies)}` : "";
  const response = await ServerApiHandler.get(`/trading/news${query}`);
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data;
}
