-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" VARCHAR(255);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" VARCHAR(100),
    "avatar" VARCHAR(255),
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "dateOfBirth" TIMESTAMP(3),
    "description" VARCHAR(255),
    "address" VARCHAR(255),
    "bio" VARCHAR(255),
    "location" VARCHAR(100),
    "website" VARCHAR(100),
    "socialLinks" VARCHAR(255),
    "interests" VARCHAR(255),
    "skills" VARCHAR(255),
    "education" VARCHAR(255),
    "experience" VARCHAR(255),
    "achievements" VARCHAR(255),
    "certifications" VARCHAR(255),
    "hobbies" VARCHAR(255),
    "languages" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
