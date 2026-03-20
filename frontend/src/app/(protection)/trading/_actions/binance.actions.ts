"use server";

import { ServerApiHandler } from "@/lib/server-api";
import { ConnectBinanceDto } from "@personalization/shared";
import { revalidatePath } from "next/cache";

export async function connectBinance(dto: ConnectBinanceDto) {
  const response = await ServerApiHandler.post("/trading/binance/connect", dto);
  if (response.error) {
    throw new Error(response.error);
  }
  revalidatePath("/trading");
  return response.data;
}

export async function disconnectBinance() {
  const response = await ServerApiHandler.delete("/trading/binance/disconnect");
  if (response.error) {
    throw new Error(response.error);
  }
  revalidatePath("/trading");
  return response.data;
}

export async function getBinanceStatus() {
  const response = await ServerApiHandler.get("/trading/binance/status");
  if (response.error) {
    return { isConnected: false, provider: null };
  }
  return response.data;
}

export async function getBinanceAccount() {
  const response = await ServerApiHandler.get("/trading/binance/account");
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data;
}

export async function getBinancePrices() {
  const response = await ServerApiHandler.get("/trading/binance/prices");
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data;
}
