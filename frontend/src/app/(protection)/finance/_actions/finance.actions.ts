"use server";

import { ServerApiHandler } from "@/lib/server-api";
import { 
  CreateWalletDto, UpdateWalletDto, 
  CreateAssetDto, UpdateAssetDto,
  CreateLoanDto, UpdateLoanDto,
  CreateBudgetDto, UpdateBudgetDto,
  CreateTransactionDto 
} from "@personalization/shared";
import { revalidatePath } from "next/cache";

// Dashboard
export async function getNetWorth() {
  const response = await ServerApiHandler.get("/finance/dashboard/net-worth");
  if (response.error) throw new Error(response.error);
  return response.data;
}

export async function getCashFlow(year?: number) {
  const query = year ? `?year=${year}` : "";
  const response = await ServerApiHandler.get(`/finance/dashboard/cash-flow${query}`);
  if (response.error) throw new Error(response.error);
  return response.data;
}

// Wallets
export async function getWallets() {
  const response = await ServerApiHandler.get("/finance/wallets");
  if (response.error) throw new Error(response.error);
  return response.data;
}

export async function createWallet(dto: CreateWalletDto) {
  const response = await ServerApiHandler.post("/finance/wallets", dto);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

export async function updateWallet(id: number, dto: UpdateWalletDto) {
  const response = await ServerApiHandler.put(`/finance/wallets/${id}`, dto);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

export async function deleteWallet(id: number) {
  const response = await ServerApiHandler.delete(`/finance/wallets/${id}`);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

// Assets
export async function getAssets() {
  const response = await ServerApiHandler.get("/finance/assets");
  if (response.error) throw new Error(response.error);
  return response.data;
}

export async function createAsset(dto: CreateAssetDto) {
  const response = await ServerApiHandler.post("/finance/assets", dto);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

export async function updateAsset(id: number, dto: UpdateAssetDto) {
  const response = await ServerApiHandler.put(`/finance/assets/${id}`, dto);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

export async function deleteAsset(id: number) {
  const response = await ServerApiHandler.delete(`/finance/assets/${id}`);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

// Loans
export async function getLoans() {
  const response = await ServerApiHandler.get("/finance/loans");
  if (response.error) throw new Error(response.error);
  return response.data;
}

export async function createLoan(dto: CreateLoanDto) {
  const response = await ServerApiHandler.post("/finance/loans", dto);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

export async function updateLoan(id: number, dto: UpdateLoanDto) {
  const response = await ServerApiHandler.put(`/finance/loans/${id}`, dto);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

export async function deleteLoan(id: number) {
  const response = await ServerApiHandler.delete(`/finance/loans/${id}`);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

// Budgets
export async function getBudget(month: number, year: number) {
  const response = await ServerApiHandler.get(`/finance/budgets?month=${month}&year=${year}`);
  if (response.error) throw new Error(response.error);
  return response.data;
}

export async function createBudget(dto: CreateBudgetDto) {
  const response = await ServerApiHandler.post("/finance/budgets", dto);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

export async function updateBudget(id: number, dto: UpdateBudgetDto) {
  const response = await ServerApiHandler.put(`/finance/budgets/${id}`, dto);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

export async function deleteBudget(id: number) {
  const response = await ServerApiHandler.delete(`/finance/budgets/${id}`);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

export async function applyAllocation(id: number) {
  const response = await ServerApiHandler.post(`/finance/budgets/categories/${id}/apply`, {});
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}

// Transactions
export async function getTransactions(walletId?: number) {
  const query = walletId ? `?walletId=${walletId}` : "";
  const response = await ServerApiHandler.get(`/finance/transactions${query}`);
  if (response.error) throw new Error(response.error);
  return response.data;
}

export async function createTransaction(dto: CreateTransactionDto) {
  const response = await ServerApiHandler.post("/finance/transactions", dto);
  if (response.error) {
    return { success: false, error: response.error };
  }
  revalidatePath("/finance");
  return { success: true, data: response.data };
}

export async function deleteTransaction(id: number) {
  const response = await ServerApiHandler.delete(`/finance/transactions/${id}`);
  if (response.error) throw new Error(response.error);
  revalidatePath("/finance");
  return response.data;
}
