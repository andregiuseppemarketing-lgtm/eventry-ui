-- CreateEnum
CREATE TYPE "ArtistType" AS ENUM ('DJ', 'VOCALIST', 'PRODUCER', 'LIVE_BAND', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'LINK');

-- CreateEnum
CREATE TYPE "FeedItemType" AS ENUM ('POST', 'EVENT_ANNOUNCEMENT', 'PHOTO', 'VIDEO', 'CHECK_IN');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'VOCALIST';
ALTER TYPE "UserRole" ADD VALUE 'ARTIST';

-- DropTable
DROP TABLE "playing_with_neon";

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
    "instagramHandle" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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

-- CreateIndex
CREATE UNIQUE INDEX "organization_profiles_userId_key" ON "organization_profiles"("userId");

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

