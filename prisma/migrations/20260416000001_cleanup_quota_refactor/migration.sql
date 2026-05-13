-- Cleanup della migration: rimuove strutture obsolete e rinomina colonne

-- Drop vecchie tabelle create da add_complimentary_system
DROP TABLE IF EXISTS "event_pr_quotas";
DROP TABLE IF EXISTS "complimentary_logs";

-- Rimuovi vecchie colonne da events
ALTER TABLE "events" 
  DROP COLUMN IF EXISTS "organizerFreePassesQuota",
  DROP COLUMN IF EXISTS "organizerFreePassesUsed";

-- Rimuovi vecchie colonne da tickets
ALTER TABLE "tickets"
  DROP COLUMN IF EXISTS "isComplimentary",
  DROP COLUMN IF EXISTS "complimentaryGrantedBy",
  DROP COLUMN IF EXISTS "complimentaryReason";

-- Refactor event_quotas: rinomina colonne e aggiorna indexes
ALTER TABLE "event_quotas" 
  RENAME COLUMN "quotaTotal" TO "total";
ALTER TABLE "event_quotas" 
  RENAME COLUMN "quotaUsed" TO "used";
ALTER TABLE "event_quotas" 
  ADD COLUMN IF NOT EXISTS "available" INTEGER NOT NULL DEFAULT 0;

-- Rimuovi vecchi index e crea nuovi
DROP INDEX IF EXISTS "event_quotas_actorType_idx";
DROP INDEX IF EXISTS "event_quotas_actorId_idx";
CREATE INDEX IF NOT EXISTS "event_quotas_actorType_actorId_idx" ON "event_quotas"("actorType", "actorId");

-- Refactor quota_audit_logs: rimuovi colonne non usate e rinomina
ALTER TABLE "quota_audit_logs"
  DROP COLUMN IF EXISTS "eventId",
  DROP COLUMN IF EXISTS "actorType",
  DROP COLUMN IF EXISTS "actorId";

ALTER TABLE "quota_audit_logs"
  RENAME COLUMN "changedByUserId" TO "changedBy";
ALTER TABLE "quota_audit_logs"
  RENAME COLUMN "beforeTotal" TO "oldValue";
ALTER TABLE "quota_audit_logs"
  RENAME COLUMN "afterTotal" TO "newValue";
ALTER TABLE "quota_audit_logs"
  RENAME COLUMN "createdAt" TO "timestamp";

-- Rimuovi vecchi index e crea nuovi
DROP INDEX IF EXISTS "quota_audit_logs_eventId_idx";
DROP INDEX IF EXISTS "quota_audit_logs_changedByUserId_idx";
CREATE INDEX IF NOT EXISTS "quota_audit_logs_timestamp_idx" ON "quota_audit_logs"("timestamp");

-- Refactor complimentary_assignment_logs: rimuovi e rinomina colonne
ALTER TABLE "complimentary_assignment_logs"
  DROP COLUMN IF EXISTS "eventId",
  DROP COLUMN IF EXISTS "actorType",
  DROP COLUMN IF EXISTS "assignedToUserId",
  DROP COLUMN IF EXISTS "assignedToGuestId",
  DROP COLUMN IF EXISTS "reason";

ALTER TABLE "complimentary_assignment_logs"
  RENAME COLUMN "assignedByUserId" TO "assignedBy";
ALTER TABLE "complimentary_assignment_logs"
  RENAME COLUMN "createdAt" TO "assignedAt";

-- Aggiungi nuove colonne (senza default per assignedTo)
ALTER TABLE "complimentary_assignment_logs"
  ADD COLUMN IF NOT EXISTS "assignedTo" TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS "guestName" TEXT;

-- Aggiorna constraint unique su ticketId
DROP INDEX IF EXISTS "complimentary_assignment_logs_ticketId_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "complimentary_assignment_logs_ticketId_key" ON "complimentary_assignment_logs"("ticketId");

-- Rimuovi vecchi index e crea nuovi
DROP INDEX IF EXISTS "complimentary_assignment_logs_eventId_idx";
DROP INDEX IF EXISTS "complimentary_assignment_logs_assignedByUserId_idx";
CREATE INDEX IF NOT EXISTS "complimentary_assignment_logs_assignedBy_idx" ON "complimentary_assignment_logs"("assignedBy");
CREATE INDEX IF NOT EXISTS "complimentary_assignment_logs_assignedAt_idx" ON "complimentary_assignment_logs"("assignedAt");

-- Aggiusta paymentRequired default su tickets
ALTER TABLE "tickets" 
  ALTER COLUMN "paymentRequired" SET DEFAULT false;

-- Aggiungi foreign keys mancanti su tickets (se non esistono già)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_paidByUserId_fkey') THEN
    ALTER TABLE "tickets" ADD CONSTRAINT "tickets_paidByUserId_fkey" 
      FOREIGN KEY ("paidByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_arrivedByUserId_fkey') THEN
    ALTER TABLE "tickets" ADD CONSTRAINT "tickets_arrivedByUserId_fkey" 
      FOREIGN KEY ("arrivedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_admittedByUserId_fkey') THEN
    ALTER TABLE "tickets" ADD CONSTRAINT "tickets_admittedByUserId_fkey" 
      FOREIGN KEY ("admittedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tickets_complimentaryQuotaId_fkey') THEN
    ALTER TABLE "tickets" ADD CONSTRAINT "tickets_complimentaryQuotaId_fkey" 
      FOREIGN KEY ("complimentaryQuotaId") REFERENCES "event_quotas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Converti complimentarySource da ActorType enum a String
ALTER TABLE "tickets" 
  ALTER COLUMN "complimentarySource" TYPE TEXT USING "complimentarySource"::TEXT;
