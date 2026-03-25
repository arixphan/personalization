-- CreateTable
CREATE TABLE "ProgressTracker" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "tags" TEXT[],
    "currentValue" DOUBLE PRECISION DEFAULT 0,
    "totalValue" DOUBLE PRECISION,
    "unit" TEXT DEFAULT 'unit',
    "startDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressItem" (
    "id" SERIAL NOT NULL,
    "progressTrackerId" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProgressTracker" ADD CONSTRAINT "ProgressTracker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressItem" ADD CONSTRAINT "ProgressItem_progressTrackerId_fkey" FOREIGN KEY ("progressTrackerId") REFERENCES "ProgressTracker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
