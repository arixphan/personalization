-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "columns" TEXT[],
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "version" TEXT NOT NULL DEFAULT '1.0';
