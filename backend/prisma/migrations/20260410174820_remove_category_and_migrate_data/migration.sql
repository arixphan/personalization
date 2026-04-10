-- 1. Map existing transactions to the correct allocation ID based on Name + Month + Year + UserId
UPDATE "Transaction" t
SET "allocationId" = (
    SELECT bc.id 
    FROM "BudgetCategory" bc
    JOIN "MonthlyBudget" mb ON bc."monthlyBudgetId" = mb.id
    JOIN "Wallet" w ON t."walletId" = w.id
    WHERE bc.name = t.category
      AND mb."userId" = w."userId"
      AND mb.month = CAST(EXTRACT(MONTH FROM t.date) AS INTEGER)
      AND mb.year = CAST(EXTRACT(YEAR FROM t.date) AS INTEGER)
    LIMIT 1
)
WHERE t."allocationId" IS NULL AND t.category IS NOT NULL;

-- 2. Preserve unmapped labels in the 'note' field before they are lost
UPDATE "Transaction"
SET note = CASE 
    WHEN note IS NULL OR note = '' THEN 'Category: ' || category
    ELSE note || ' (Category: ' || category || ')'
END
WHERE "allocationId" IS NULL AND category IS NOT NULL;

-- 4. Finally, drop the legacy column
ALTER TABLE "Transaction" DROP COLUMN "category";
