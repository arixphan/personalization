-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "priority" TEXT DEFAULT 'medium',
ADD COLUMN     "type" TEXT DEFAULT 'task',
ALTER COLUMN "description" SET DATA TYPE VARCHAR(500);
