"use server";

import { ServerApiHandler } from "@/lib/server-api";
import { CreateStrategyDto, UpdateStrategyDto, ReorderStrategiesDto } from "@personalization/shared";
import { revalidatePath } from "next/cache";

/**
 * Server action to fetch all strategies for the current user
 */
export async function getStrategies() {
  const response = await ServerApiHandler.get("/trading/strategies");
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data;
}

/**
 * Server action to create a new strategy
 */
export async function createStrategy(dto: CreateStrategyDto) {
  const response = await ServerApiHandler.post("/trading/strategies", dto);
  if (response.error) {
    throw new Error(response.error);
  }
  revalidatePath("/trading/strategies");
  return response.data;
}

/**
 * Server action to update an existing strategy
 */
export async function updateStrategy(id: number, dto: UpdateStrategyDto) {
  const response = await ServerApiHandler.put(`/trading/strategies/${id}`, dto);
  if (response.error) {
    throw new Error(response.error);
  }
  revalidatePath("/trading/strategies");
  return response.data;
}

/**
 * Server action to delete a strategy
 */
export async function deleteStrategy(id: number) {
  const response = await ServerApiHandler.delete(`/trading/strategies/${id}`);
  if (response.error) {
    throw new Error(response.error);
  }
  revalidatePath("/trading/strategies");
  return response.data;
}

/**
 * Server action to reorder strategies
 */
export async function reorderStrategies(dto: ReorderStrategiesDto) {
  const response = await ServerApiHandler.patch("/trading/strategies/reorder", dto);
  if (response.error) {
    throw new Error(response.error);
  }
  revalidatePath("/trading/strategies");
  return response.data;
}
