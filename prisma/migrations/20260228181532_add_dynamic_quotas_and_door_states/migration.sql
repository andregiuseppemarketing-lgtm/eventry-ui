-- Add VENUE role to UserRole enum
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'VENUE';

-- Add new TicketStatus values
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'REGISTERED';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'ARRIVED';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'ADMITTED';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "TicketStatus" ADD VALUE IF NOT EXISTS 'NO_SHOW';

-- Add new PaymentStatus values
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'NOT_REQUIRED';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'UNPAID';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PAID_DOOR';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PAID_ONLINE';

-- Create ActorType enum
CREATE TYPE "ActorType" AS ENUM ('PR', 'ORGANIZATION', 'VENUE');

-- Create PaymentMethod enum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD_DOOR', 'SATISPAY', 'STRIPE', 'COMPLIMENTARY', 'FREE_EVENT');

-- Add EMERGENCY to Gate enum
ALTER TYPE "Gate" ADD VALUE IF NOT EXISTS 'EMERGENCY';

-- AlterTable tickets: Add new tracking fields
ALTER TABLE "tickets" 
  ADD COLUMN "paymentRequired" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "paymentMethod" "PaymentMethod",
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "paidByUserId" TEXT,
  ADD COLUMN "paidAmount" DOUBLE PRECISION,
  ADD COLUMN "paidGate" "Gate",
  ADD COLUMN "complimentarySource" "ActorType",
  ADD COLUMN "complimentaryQuotaId" TEXT,
  ADD COLUMN "arrivedAt" TIMESTAMP(3),
  ADD COLUMN "arrivedByUserId" TEXT,
  ADD COLUMN "arrivedGate" "Gate",
  ADD COLUMN "admittedAt" TIMESTAMP(3),
  ADD COLUMN "admittedByUserId" TEXT,
  ADD COLUMN "admittedGate" "Gate";

-- CreateTable EventQuota (unified quotas for PR/ORGANIZATION/VENUE)
CREATE TABLE "event_quotas" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "quotaTotal" INTEGER NOT NULL DEFAULT 0,
    "quotaUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable QuotaAuditLog
CREATE TABLE "quota_audit_logs" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "quotaId" TEXT NOT NULL,
    "changedByUserId" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "beforeTotal" INTEGER NOT NULL,
    "afterTotal" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quota_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable ComplimentaryAssignmentLog
CREATE TABLE "complimentary_assignment_logs" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "quotaId" TEXT NOT NULL,
    "assignedByUserId" TEXT NOT NULL,
    "assignedToUserId" TEXT,
    "assignedToGuestId" TEXT,
    "actorType" "ActorType" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complimentary_assignment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_quotas_eventId_idx" ON "event_quotas"("eventId");
CREATE INDEX "event_quotas_actorType_idx" ON "event_quotas"("actorType");
CREATE INDEX "event_quotas_actorId_idx" ON "event_quotas"("actorId");
CREATE UNIQUE INDEX "event_quotas_eventId_actorType_actorId_key" ON "event_quotas"("eventId", "actorType", "actorId");

CREATE INDEX "quota_audit_logs_eventId_idx" ON "quota_audit_logs"("eventId");
CREATE INDEX "quota_audit_logs_quotaId_idx" ON "quota_audit_logs"("quotaId");
CREATE INDEX "quota_audit_logs_changedByUserId_idx" ON "quota_audit_logs"("changedByUserId");

CREATE INDEX "complimentary_assignment_logs_eventId_idx" ON "complimentary_assignment_logs"("eventId");
CREATE INDEX "complimentary_assignment_logs_ticketId_idx" ON "complimentary_assignment_logs"("ticketId");
CREATE INDEX "complimentary_assignment_logs_quotaId_idx" ON "complimentary_assignment_logs"("quotaId");
CREATE INDEX "complimentary_assignment_logs_assignedByUserId_idx" ON "complimentary_assignment_logs"("assignedByUserId");

-- AddForeignKey
ALTER TABLE "event_quotas" ADD CONSTRAINT "event_quotas_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "quota_audit_logs" ADD CONSTRAINT "quota_audit_logs_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "event_quotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "complimentary_assignment_logs" ADD CONSTRAINT "complimentary_assignment_logs_quotaId_fkey" FOREIGN KEY ("quotaId") REFERENCES "event_quotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
