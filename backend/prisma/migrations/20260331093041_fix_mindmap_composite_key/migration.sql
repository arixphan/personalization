/*
  Warnings:

  - The primary key for the `MindMapEdge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MindMapNode` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateEnum
CREATE TYPE "EnglishRecordType" AS ENUM ('WORD', 'PHRASE', 'GRAMMAR', 'SENTENCE');

-- AlterTable
ALTER TABLE "MindMapEdge" DROP CONSTRAINT "MindMapEdge_pkey",
ADD CONSTRAINT "MindMapEdge_pkey" PRIMARY KEY ("mindMapId", "id");

-- AlterTable
ALTER TABLE "MindMapNode" DROP CONSTRAINT "MindMapNode_pkey",
ADD CONSTRAINT "MindMapNode_pkey" PRIMARY KEY ("mindMapId", "id");

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "isClosed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MarketAnalysis" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "interval" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "priceData" JSONB,
    "sentiment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishRecord" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "EnglishRecordType" NOT NULL DEFAULT 'WORD',
    "content" TEXT NOT NULL,
    "definition" TEXT,
    "translation" TEXT,
    "example" TEXT,
    "note" TEXT,
    "tags" TEXT[],
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnglishRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnglishWriting" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "feedback" JSONB,
    "title" VARCHAR(255),
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnglishWriting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketAnalysis_userId_interval_date_key" ON "MarketAnalysis"("userId", "interval", "date");

-- CreateIndex
CREATE INDEX "EnglishRecord_userId_type_idx" ON "EnglishRecord"("userId", "type");

-- CreateIndex
CREATE INDEX "EnglishWriting_userId_createdAt_idx" ON "EnglishWriting"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "MarketAnalysis" ADD CONSTRAINT "MarketAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnglishRecord" ADD CONSTRAINT "EnglishRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnglishWriting" ADD CONSTRAINT "EnglishWriting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
