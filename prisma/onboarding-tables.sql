-- Onboarding Tables Migration
-- Run this SQL on Vercel/Neon production database

-- Table: user_phones
CREATE TABLE IF NOT EXISTS "user_phones" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
  "phoneVerifiedAt" TIMESTAMP(3),
  "otpCode" TEXT,
  "otpExpiresAt" TIMESTAMP(3),
  "otpAttempts" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_phones_pkey" PRIMARY KEY ("id")
);

-- Table: user_consents
CREATE TABLE IF NOT EXISTS "user_consents" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
  "termsAcceptedAt" TIMESTAMP(3),
  "privacyAccepted" BOOLEAN NOT NULL DEFAULT false,
  "privacyAcceptedAt" TIMESTAMP(3),
  "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
  "marketingOptInAt" TIMESTAMP(3),
  "newsletterOptIn" BOOLEAN NOT NULL DEFAULT false,
  "newsletterOptInAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

-- Table: onboarding_progress
CREATE TABLE IF NOT EXISTS "onboarding_progress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "currentStep" INTEGER NOT NULL DEFAULT 1,
  "step1Completed" BOOLEAN NOT NULL DEFAULT false,
  "step2Completed" BOOLEAN NOT NULL DEFAULT false,
  "step3Completed" BOOLEAN NOT NULL DEFAULT false,
  "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "onboarding_progress_pkey" PRIMARY KEY ("id")
);

-- Unique Constraints
CREATE UNIQUE INDEX IF NOT EXISTS "user_phones_userId_key" ON "user_phones"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "user_phones_phoneNumber_key" ON "user_phones"("phoneNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "user_consents_userId_key" ON "user_consents"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "onboarding_progress_userId_key" ON "onboarding_progress"("userId");

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "user_phones_phoneNumber_idx" ON "user_phones"("phoneNumber");
CREATE INDEX IF NOT EXISTS "user_phones_userId_idx" ON "user_phones"("userId");
CREATE INDEX IF NOT EXISTS "user_consents_userId_idx" ON "user_consents"("userId");
CREATE INDEX IF NOT EXISTS "onboarding_progress_userId_idx" ON "onboarding_progress"("userId");

-- Foreign Keys
ALTER TABLE "user_phones" ADD CONSTRAINT "user_phones_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
