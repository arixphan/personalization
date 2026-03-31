/*
  Warnings:

  - The primary key for the `MindMapEdge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MindMapNode` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "MindMapEdge" DROP CONSTRAINT "MindMapEdge_pkey",
ADD CONSTRAINT "MindMapEdge_pkey" PRIMARY KEY ("mindMapId", "id");

-- AlterTable
ALTER TABLE "MindMapNode" DROP CONSTRAINT "MindMapNode_pkey",
ADD CONSTRAINT "MindMapNode_pkey" PRIMARY KEY ("mindMapId", "id");
