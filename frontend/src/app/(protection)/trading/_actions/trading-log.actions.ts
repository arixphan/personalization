"use server";

import { ServerApiHandler } from "@/lib/server-api";
import { CreateTradingLogDto, UpdateTradingLogDto } from "@personalization/shared";
import { revalidatePath } from "next/cache";

/**
 * Server action to fetch trading logs for a specific month
 */
export async function getTradingLogsByMonth(month: string) {
  const response = await ServerApiHandler.get(`/trading/logs?month=${month}`);
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * Server action to fetch a log by date
 */
export async function getTradingLogByDate(date: string) {
  const response = await ServerApiHandler.get(`/trading/logs?date=${date}`);
  if (response.error) {
    return null;
  }
  // Standardize response: backend might return a single object or an array
  const data = response.data;
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Server action to create or update a trading log
 */
export async function upsertTradingLog(date: string, content: string, sentiment: any) {
  // First, try to find an existing log for this date
  const existing = await getTradingLogByDate(date);
  
  if (existing) {
    const response = await ServerApiHandler.put(`/trading/logs/${existing.id}`, {
      content,
      sentiment,
    });
    if (response.error) throw new Error(response.error);
    revalidatePath("/trading");
    return response.data;
  } else {
    const response = await ServerApiHandler.post("/trading/logs", {
      date: new Date(date).toISOString(),
      content,
      sentiment,
    });
    if (response.error) throw new Error(response.error);
    revalidatePath("/trading");
    return response.data;
  }
}
