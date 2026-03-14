/*
  Warnings:

  - A unique constraint covering the columns `[projectId,title]` on the table `Phase` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Phase_title_key";

-- CreateIndex
CREATE UNIQUE INDEX "Phase_projectId_title_key" ON "Phase"("projectId", "title");
