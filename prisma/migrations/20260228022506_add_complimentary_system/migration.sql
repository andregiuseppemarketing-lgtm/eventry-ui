-- AlterTable
ALTER TABLE "events" ADD COLUMN "organizerFreePassesQuota" INTEGER DEFAULT 0,
ADD COLUMN "organizerFreePassesUsed" INTEGER DEFAULT 0;

-- AlterTable  
ALTER TABLE "tickets" ADD COLUMN "isComplimentary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "complimentaryGrantedBy" TEXT,
ADD COLUMN "complimentaryReason" TEXT;

-- CreateTable
CREATE TABLE "event_pr_quotas" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "prUserId" TEXT NOT NULL,
    "maxFreePasses" INTEGER NOT NULL DEFAULT 0,
    "usedFreePasses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_pr_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complimentary_logs" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ticketId" TEXT,
    "grantedBy" TEXT NOT NULL,
    "grantedTo" TEXT NOT NULL,
    "reason" TEXT,
    "scannedAt" TIMESTAMP(3),
    "admittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complimentary_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_pr_quotas_eventId_idx" ON "event_pr_quotas"("eventId");

-- CreateIndex
CREATE INDEX "event_pr_quotas_prUserId_idx" ON "event_pr_quotas"("prUserId");

-- CreateIndex
CREATE UNIQUE INDEX "event_pr_quotas_eventId_prUserId_key" ON "event_pr_quotas"("eventId", "prUserId");

-- CreateIndex
CREATE INDEX "complimentary_logs_eventId_idx" ON "complimentary_logs"("eventId");

-- CreateIndex
CREATE INDEX "complimentary_logs_grantedBy_idx" ON "complimentary_logs"("grantedBy");

-- CreateIndex
CREATE INDEX "complimentary_logs_grantedTo_idx" ON "complimentary_logs"("grantedTo");

-- AddForeignKey
ALTER TABLE "event_pr_quotas" ADD CONSTRAINT "event_pr_quotas_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_pr_quotas" ADD CONSTRAINT "event_pr_quotas_prUserId_fkey" FOREIGN KEY ("prUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complimentary_logs" ADD CONSTRAINT "complimentary_logs_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
