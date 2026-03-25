import { z } from 'zod';

export enum AssetType {
  PROPERTY = 'PROPERTY',
  VEHICLE = 'VEHICLE',
  INVESTMENT = 'INVESTMENT',
  OTHER = 'OTHER',
}

export enum LoanType {
  PAYABLE = 'PAYABLE',
  RECEIVABLE = 'RECEIVABLE',
}

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  PAID_OFF = 'PAID_OFF',
  DEFAULTED = 'DEFAULTED',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

// Wallet DTOs
export const CreateWalletSchema = z.object({
  name: z.string().min(1),
  balance: z.number().default(0),
  currency: z.string().default('VND'),
});
export type CreateWalletDto = z.infer<typeof CreateWalletSchema>;

export const UpdateWalletSchema = CreateWalletSchema.partial();
export type UpdateWalletDto = z.infer<typeof UpdateWalletSchema>;

// Asset DTOs
export const CreateAssetSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(AssetType),
  value: z.number(),
  description: z.string().optional(),
});
export type CreateAssetDto = z.infer<typeof CreateAssetSchema>;

export const UpdateAssetSchema = CreateAssetSchema.partial();
export type UpdateAssetDto = z.infer<typeof UpdateAssetSchema>;

// Loan DTOs
export const CreateLoanSchema = z.object({
  type: z.nativeEnum(LoanType),
  counterparty: z.string().min(1),
  principal: z.number(),
  remaining: z.number(),
  interestRate: z.number().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  status: z.nativeEnum(LoanStatus).default(LoanStatus.ACTIVE),
  note: z.string().optional(),
  walletId: z.number().optional().nullable(),
});
export type CreateLoanDto = z.infer<typeof CreateLoanSchema>;

export const UpdateLoanSchema = CreateLoanSchema.partial();
export type UpdateLoanDto = z.infer<typeof UpdateLoanSchema>;

// Budget DTOs
export const BudgetCategorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  limitAmount: z.number(),
  spentAmount: z.number().optional(),
  affectsBalance: z.boolean().default(true),
  isAutomationEnabled: z.boolean().default(true),
  type: z.nativeEnum(TransactionType).default(TransactionType.EXPENSE),
  automationDay: z.number().min(1).max(31).optional().nullable(),
  targetWalletId: z.number().optional().nullable(),
  automationProcessed: z.boolean().optional(),
});

export const CreateBudgetSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number(),
  categories: z.array(BudgetCategorySchema),
});
export type CreateBudgetDto = z.infer<typeof CreateBudgetSchema>;

export const UpdateBudgetSchema = z.object({
  categories: z.array(BudgetCategorySchema).optional(),
});
export type UpdateBudgetDto = z.infer<typeof UpdateBudgetSchema>;

// Transaction DTOs
export const CreateTransactionSchema = z.object({
  walletId: z.number(),
  toWalletId: z.number().optional().nullable(),
  amount: z.number(),
  type: z.nativeEnum(TransactionType),
  category: z.string().optional(),
  date: z.string().datetime().optional(),
  note: z.string().optional(),
  loanId: z.number().optional().nullable(),
});
export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;
