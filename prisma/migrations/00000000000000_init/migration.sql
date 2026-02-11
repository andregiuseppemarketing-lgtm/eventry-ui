-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ClubType" AS ENUM ('DISCOTECA', 'PUB', 'LIDO', 'ALTRO');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ORGANIZER', 'DJ', 'VOCALIST', 'ARTIST', 'PR', 'STAFF', 'USER', 'SECURITY');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('F', 'M', 'NB', 'UNK');

-- CreateEnum
CREATE TYPE "ListType" AS ENUM ('PR', 'GUEST', 'STAFF');

-- CreateEnum
CREATE TYPE "CreatedVia" AS ENUM ('MANUAL', 'IMPORT', 'LINK');

-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('FREE', 'LIST', 'PAID', 'FREE_LIST', 'DOOR_ONLY', 'PRE_SALE', 'FULL_TICKET');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('NEW', 'PENDING', 'PAID', 'USED', 'CHECKED_IN', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Gate" AS ENUM ('MAIN', 'VIP', 'STAFF');

-- CreateEnum
CREATE TYPE "BookingMethod" AS ENUM ('INSTAGRAM', 'WHATSAPP', 'WEBSITE', 'APP', 'PHONE', 'MANUAL');

-- CreateEnum
CREATE TYPE "CustomerSegment" AS ENUM ('NEW', 'OCCASIONAL', 'REGULAR', 'VIP', 'DORMANT');

-- CreateEnum
CREATE TYPE "ArtistType" AS ENUM ('DJ', 'VOCALIST', 'PRODUCER', 'LIVE_BAND', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'LINK');

-- CreateEnum
CREATE TYPE "FeedItemType" AS ENUM ('POST', 'EVENT_ANNOUNCEMENT', 'PHOTO', 'VIDEO', 'CHECK_IN');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_CARD', 'PASSPORT', 'DRIVER_LICENSE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "age" INTEGER,
    "ageConsent" BOOLEAN NOT NULL DEFAULT false,
    "identityVerified" BOOLEAN NOT NULL DEFAULT false,
    "identityVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ageVerified" BOOLEAN NOT NULL DEFAULT false,
    "displayName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "middleName" TEXT,
    "username" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ClubType" NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "openingHours" TEXT,
    "priceRange" TEXT,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "musicGenres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "capacity" INTEGER,
    "clubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT,
    "telegramHandle" TEXT,
    "whatsappNumber" TEXT,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverUrl" TEXT,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3),
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "minAge" INTEGER,
    "dressCode" TEXT,
    "ticketType" "TicketType" NOT NULL DEFAULT 'FREE_LIST',
    "ticketPrice" DOUBLE PRECISION,
    "maxGuests" INTEGER DEFAULT 0,
    "venueId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pr_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "referralCode" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pr_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "prProfileId" TEXT NOT NULL,
    "quotaTotal" INTEGER,
    "quotaFemale" INTEGER,
    "quotaMale" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lists" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ListType" NOT NULL,
    "quotaTotal" INTEGER,
    "quotaFemale" INTEGER,
    "quotaMale" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "nickname" TEXT,
    "birthDate" TIMESTAMP(3),
    "city" TEXT,
    "occupation" TEXT,
    "instagram" TEXT,
    "telegramChatId" TEXT,
    "whatsappPhone" TEXT,
    "totalEvents" INTEGER NOT NULL DEFAULT 0,
    "lastEventDate" TIMESTAMP(3),
    "customerSegment" "CustomerSegment" NOT NULL DEFAULT 'NEW',
    "preferredDays" TEXT,
    "averageArrivalTime" TEXT,
    "prefersTable" BOOLEAN NOT NULL DEFAULT false,
    "averageGroupSize" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_entries" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "guestId" TEXT,
    "addedByUserId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "gender" "Gender" NOT NULL DEFAULT 'UNK',
    "note" TEXT,
    "createdVia" "CreatedVia" NOT NULL DEFAULT 'MANUAL',
    "status" "EntryStatus" NOT NULL DEFAULT 'PENDING',
    "plusOne" BOOLEAN NOT NULL DEFAULT false,
    "bookingMethod" "BookingMethod" NOT NULL DEFAULT 'MANUAL',
    "referralSource" TEXT,
    "groupSize" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "guestId" TEXT,
    "listEntryId" TEXT,
    "issuedByUserId" TEXT,
    "type" "TicketType" NOT NULL DEFAULT 'FREE_LIST',
    "price" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'EUR',
    "code" TEXT NOT NULL,
    "qrData" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'NEW',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paymentIntentId" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "receiptUrl" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkins" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "scannedByUserId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gate" "Gate" NOT NULL DEFAULT 'MAIN',
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "arrivalTime" TEXT,
    "groupSize" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_links" (
    "id" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "prProfileId" TEXT,
    "slug" TEXT NOT NULL,
    "maxUses" INTEGER,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invite_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resendId" TEXT,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumptions" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "items" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_tracking" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "eventId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "metadata" JSONB,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referer" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funnel_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_feedbacks" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ticketId" TEXT,
    "guestId" TEXT,
    "overallRating" INTEGER NOT NULL,
    "musicRating" INTEGER,
    "serviceRating" INTEGER,
    "venueRating" INTEGER,
    "comment" TEXT,
    "wouldReturn" BOOLEAN,
    "interests" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_notes" (
    "id" TEXT NOT NULL,
    "guestId" TEXT,
    "eventId" TEXT,
    "ticketId" TEXT,
    "severity" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reportedByUserId" TEXT NOT NULL,
    "actionTaken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_preferences" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "musicGenres" JSONB,
    "dressStyle" TEXT,
    "drinkPreferences" JSONB,
    "avgSpending" DOUBLE PRECISION,
    "responseToPromo" TEXT,
    "socialEngagement" TEXT,
    "conversionScore" DOUBLE PRECISION,
    "lifetimeValue" DOUBLE PRECISION,
    "consents" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "bio" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "totalEvents" INTEGER NOT NULL DEFAULT 0,
    "totalAttendees" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT,
    "telegramHandle" TEXT,
    "whatsappNumber" TEXT,

    CONSTRAINT "organization_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "artistType" "ArtistType" NOT NULL,
    "bio" TEXT,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "website" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "soundcloud" TEXT,
    "spotify" TEXT,
    "youtube" TEXT,
    "avatar" TEXT,
    "coverImage" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "totalGigs" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performances" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "eventId" TEXT,
    "eventName" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "venueName" TEXT NOT NULL,
    "city" TEXT,
    "description" TEXT,
    "fee" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_media" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artist_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "coverImage" TEXT,
    "city" TEXT,
    "birthDate" TIMESTAMP(3),
    "gender" "Gender",
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "favoriteGenres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredVenues" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "followingCount" INTEGER NOT NULL DEFAULT 0,
    "postsCount" INTEGER NOT NULL DEFAULT 0,
    "spotifyUrl" TEXT,
    "tiktokHandle" TEXT,
    "instagram" TEXT,
    "verifiedBadge" BOOLEAN NOT NULL DEFAULT false,
    "slug" TEXT,
    "telegramHandle" TEXT,
    "whatsappNumber" TEXT,
    "provincia" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_items" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "FeedItemType" NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "eventId" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "likesCount" INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feed_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_likes" (
    "id" TEXT NOT NULL,
    "feedItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_comments" (
    "id" TEXT NOT NULL,
    "feedItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feed_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "documentNumber" TEXT,
    "documentFrontUrl" TEXT NOT NULL,
    "documentBackUrl" TEXT,
    "selfieUrl" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_phones" (
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

-- CreateTable
CREATE TABLE "user_consents" (
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

-- CreateTable
CREATE TABLE "onboarding_progress" (
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

-- CreateTable
CREATE TABLE "event_stats" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ticketsSold" INTEGER NOT NULL DEFAULT 0,
    "revenueTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "checkIns" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventsCreated" INTEGER NOT NULL DEFAULT 0,
    "ticketsBought" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_logs" (
    "id" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetId" TEXT,
    "userId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "venues_slug_key" ON "venues"("slug");

-- CreateIndex
CREATE INDEX "events_status_dateStart_idx" ON "events"("status", "dateStart");

-- CreateIndex
CREATE INDEX "events_venueId_idx" ON "events"("venueId");

-- CreateIndex
CREATE UNIQUE INDEX "pr_profiles_userId_key" ON "pr_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pr_profiles_referralCode_key" ON "pr_profiles"("referralCode");

-- CreateIndex
CREATE INDEX "pr_profiles_referralCode_idx" ON "pr_profiles"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "assignments_eventId_prProfileId_key" ON "assignments"("eventId", "prProfileId");

-- CreateIndex
CREATE INDEX "lists_eventId_type_idx" ON "lists"("eventId", "type");

-- CreateIndex
CREATE INDEX "guests_email_idx" ON "guests"("email");

-- CreateIndex
CREATE INDEX "guests_phone_idx" ON "guests"("phone");

-- CreateIndex
CREATE INDEX "guests_instagram_idx" ON "guests"("instagram");

-- CreateIndex
CREATE INDEX "guests_customerSegment_idx" ON "guests"("customerSegment");

-- CreateIndex
CREATE INDEX "guests_telegramChatId_idx" ON "guests"("telegramChatId");

-- CreateIndex
CREATE INDEX "list_entries_listId_status_idx" ON "list_entries"("listId", "status");

-- CreateIndex
CREATE INDEX "list_entries_email_idx" ON "list_entries"("email");

-- CreateIndex
CREATE INDEX "list_entries_phone_idx" ON "list_entries"("phone");

-- CreateIndex
CREATE INDEX "list_entries_bookingMethod_idx" ON "list_entries"("bookingMethod");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_code_key" ON "tickets"("code");

-- CreateIndex
CREATE INDEX "tickets_code_idx" ON "tickets"("code");

-- CreateIndex
CREATE INDEX "tickets_eventId_status_idx" ON "tickets"("eventId", "status");

-- CreateIndex
CREATE INDEX "tickets_userId_idx" ON "tickets"("userId");

-- CreateIndex
CREATE INDEX "tickets_guestId_idx" ON "tickets"("guestId");

-- CreateIndex
CREATE INDEX "checkins_ticketId_idx" ON "checkins"("ticketId");

-- CreateIndex
CREATE INDEX "checkins_scannedAt_idx" ON "checkins"("scannedAt");

-- CreateIndex
CREATE INDEX "checkins_gate_idx" ON "checkins"("gate");

-- CreateIndex
CREATE UNIQUE INDEX "invite_links_slug_key" ON "invite_links"("slug");

-- CreateIndex
CREATE INDEX "invite_links_slug_idx" ON "invite_links"("slug");

-- CreateIndex
CREATE INDEX "invite_links_eventId_idx" ON "invite_links"("eventId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "email_logs_recipient_idx" ON "email_logs"("recipient");

-- CreateIndex
CREATE INDEX "email_logs_type_idx" ON "email_logs"("type");

-- CreateIndex
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");

-- CreateIndex
CREATE INDEX "email_logs_sentAt_idx" ON "email_logs"("sentAt");

-- CreateIndex
CREATE INDEX "consumptions_ticketId_idx" ON "consumptions"("ticketId");

-- CreateIndex
CREATE INDEX "consumptions_eventId_idx" ON "consumptions"("eventId");

-- CreateIndex
CREATE INDEX "consumptions_createdAt_idx" ON "consumptions"("createdAt");

-- CreateIndex
CREATE INDEX "funnel_tracking_sessionId_idx" ON "funnel_tracking"("sessionId");

-- CreateIndex
CREATE INDEX "funnel_tracking_eventId_idx" ON "funnel_tracking"("eventId");

-- CreateIndex
CREATE INDEX "funnel_tracking_step_idx" ON "funnel_tracking"("step");

-- CreateIndex
CREATE INDEX "funnel_tracking_timestamp_idx" ON "funnel_tracking"("timestamp");

-- CreateIndex
CREATE INDEX "event_feedbacks_eventId_idx" ON "event_feedbacks"("eventId");

-- CreateIndex
CREATE INDEX "event_feedbacks_guestId_idx" ON "event_feedbacks"("guestId");

-- CreateIndex
CREATE INDEX "event_feedbacks_overallRating_idx" ON "event_feedbacks"("overallRating");

-- CreateIndex
CREATE INDEX "security_notes_guestId_idx" ON "security_notes"("guestId");

-- CreateIndex
CREATE INDEX "security_notes_severity_idx" ON "security_notes"("severity");

-- CreateIndex
CREATE INDEX "security_notes_eventId_idx" ON "security_notes"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "customer_preferences_guestId_key" ON "customer_preferences"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_profiles_userId_key" ON "organization_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_profiles_slug_key" ON "organization_profiles"("slug");

-- CreateIndex
CREATE INDEX "organization_profiles_verified_idx" ON "organization_profiles"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "artist_profiles_userId_key" ON "artist_profiles"("userId");

-- CreateIndex
CREATE INDEX "artist_profiles_artistType_idx" ON "artist_profiles"("artistType");

-- CreateIndex
CREATE INDEX "artist_profiles_verified_idx" ON "artist_profiles"("verified");

-- CreateIndex
CREATE INDEX "performances_artistId_idx" ON "performances"("artistId");

-- CreateIndex
CREATE INDEX "performances_eventDate_idx" ON "performances"("eventDate");

-- CreateIndex
CREATE INDEX "artist_media_artistId_idx" ON "artist_media"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_slug_key" ON "user_profiles"("slug");

-- CreateIndex
CREATE INDEX "user_follows_followerId_idx" ON "user_follows"("followerId");

-- CreateIndex
CREATE INDEX "user_follows_followingId_idx" ON "user_follows"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "user_follows_followerId_followingId_key" ON "user_follows"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "feed_items_authorId_idx" ON "feed_items"("authorId");

-- CreateIndex
CREATE INDEX "feed_items_createdAt_idx" ON "feed_items"("createdAt");

-- CreateIndex
CREATE INDEX "feed_items_type_idx" ON "feed_items"("type");

-- CreateIndex
CREATE INDEX "feed_likes_feedItemId_idx" ON "feed_likes"("feedItemId");

-- CreateIndex
CREATE INDEX "feed_likes_userId_idx" ON "feed_likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "feed_likes_feedItemId_userId_key" ON "feed_likes"("feedItemId", "userId");

-- CreateIndex
CREATE INDEX "feed_comments_feedItemId_idx" ON "feed_comments"("feedItemId");

-- CreateIndex
CREATE INDEX "feed_comments_userId_idx" ON "feed_comments"("userId");

-- CreateIndex
CREATE INDEX "identity_verifications_userId_idx" ON "identity_verifications"("userId");

-- CreateIndex
CREATE INDEX "identity_verifications_status_idx" ON "identity_verifications"("status");

-- CreateIndex
CREATE INDEX "identity_verifications_createdAt_idx" ON "identity_verifications"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_phones_userId_key" ON "user_phones"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_phones_phoneNumber_key" ON "user_phones"("phoneNumber");

-- CreateIndex
CREATE INDEX "user_phones_phoneNumber_idx" ON "user_phones"("phoneNumber");

-- CreateIndex
CREATE INDEX "user_phones_userId_idx" ON "user_phones"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_consents_userId_key" ON "user_consents"("userId");

-- CreateIndex
CREATE INDEX "user_consents_userId_idx" ON "user_consents"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_progress_userId_key" ON "onboarding_progress"("userId");

-- CreateIndex
CREATE INDEX "onboarding_progress_userId_idx" ON "onboarding_progress"("userId");

-- CreateIndex
CREATE INDEX "onboarding_progress_onboardingComplete_idx" ON "onboarding_progress"("onboardingComplete");

-- CreateIndex
CREATE INDEX "event_stats_eventId_idx" ON "event_stats"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_userId_key" ON "user_stats"("userId");

-- CreateIndex
CREATE INDEX "analytics_logs_actionType_createdAt_idx" ON "analytics_logs"("actionType", "createdAt");

-- CreateIndex
CREATE INDEX "analytics_logs_userId_idx" ON "analytics_logs"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pr_profiles" ADD CONSTRAINT "pr_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_prProfileId_fkey" FOREIGN KEY ("prProfileId") REFERENCES "pr_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lists" ADD CONSTRAINT "lists_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_entries" ADD CONSTRAINT "list_entries_addedByUserId_fkey" FOREIGN KEY ("addedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_entries" ADD CONSTRAINT "list_entries_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_entries" ADD CONSTRAINT "list_entries_listId_fkey" FOREIGN KEY ("listId") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_issuedByUserId_fkey" FOREIGN KEY ("issuedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_listEntryId_fkey" FOREIGN KEY ("listEntryId") REFERENCES "list_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_scannedByUserId_fkey" FOREIGN KEY ("scannedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_prProfileId_fkey" FOREIGN KEY ("prProfileId") REFERENCES "pr_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumptions" ADD CONSTRAINT "consumptions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumptions" ADD CONSTRAINT "consumptions_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funnel_tracking" ADD CONSTRAINT "funnel_tracking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedbacks" ADD CONSTRAINT "event_feedbacks_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedbacks" ADD CONSTRAINT "event_feedbacks_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_feedbacks" ADD CONSTRAINT "event_feedbacks_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_notes" ADD CONSTRAINT "security_notes_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_notes" ADD CONSTRAINT "security_notes_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_notes" ADD CONSTRAINT "security_notes_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_notes" ADD CONSTRAINT "security_notes_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_preferences" ADD CONSTRAINT "customer_preferences_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_profiles" ADD CONSTRAINT "organization_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_profiles" ADD CONSTRAINT "artist_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performances" ADD CONSTRAINT "performances_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_media" ADD CONSTRAINT "artist_media_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_items" ADD CONSTRAINT "feed_items_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_likes" ADD CONSTRAINT "feed_likes_feedItemId_fkey" FOREIGN KEY ("feedItemId") REFERENCES "feed_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_likes" ADD CONSTRAINT "feed_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comments" ADD CONSTRAINT "feed_comments_feedItemId_fkey" FOREIGN KEY ("feedItemId") REFERENCES "feed_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_comments" ADD CONSTRAINT "feed_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_phones" ADD CONSTRAINT "user_phones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_stats" ADD CONSTRAINT "event_stats_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_logs" ADD CONSTRAINT "analytics_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

