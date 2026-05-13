-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('VENUE', 'ORGANIZATION', 'FESTIVAL', 'PR', 'ARTIST');

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "type" "PageType" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_ownerId_idx" ON "pages"("ownerId");

-- CreateIndex
CREATE INDEX "pages_slug_idx" ON "pages"("slug");

-- AlterTable
ALTER TABLE "events" ADD COLUMN "createdByPageId" TEXT;

-- CreateIndex
CREATE INDEX "events_createdByPageId_idx" ON "events"("createdByPageId");

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_createdByPageId_fkey" FOREIGN KEY ("createdByPageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
