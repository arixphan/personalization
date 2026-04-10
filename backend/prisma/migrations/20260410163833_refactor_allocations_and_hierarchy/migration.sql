/*
  Warnings:

  - The `type` column on the `BudgetCategory` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AllocationType" AS ENUM ('INCOME', 'EXPENSE', 'SUB_WALLET');

-- AlterTable
ALTER TABLE "BudgetCategory" ADD COLUMN     "parentId" INTEGER,
DROP COLUMN "type",
ADD COLUMN     "type" "AllocationType" NOT NULL DEFAULT 'EXPENSE';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "allocationId" INTEGER;

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BudgetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "BudgetCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
