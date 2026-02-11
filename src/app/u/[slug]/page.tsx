import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ChatButton } from '@/components/chat-button';
import { FollowButton } from '@/components/follow-button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, CheckCircle2, Music } from 'lucide-react';
import Image from 'next/image';

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;

  const profile = await prisma.userProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          username: true,
          firstName: true,
          lastName: true,
          identityVerified: true,
        },
      },
    },
  });

  if (!profile || !profile.isPublic) {
    notFound();
  }

  const displayName = profile.user.username || `${profile.user.firstName} ${profile.user.lastName}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      {profile.coverImage && (
        <div className="relative h-64 w-full bg-gradient-to-b from-primary/20 to-background">
          <Image
            src={profile.coverImage}
            alt="Cover"
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start -mt-20 md:-mt-16">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-background bg-muted overflow-hidden">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={displayName}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold">{displayName}</h1>
                {profile.user.identityVerified && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verificato
                  </Badge>
                )}
                {profile.verifiedBadge && (
                  <Badge variant="default" className="gap-1 bg-blue-600">
                    <CheckCircle2 className="w-3 h-3" />
                    VIP
                  </Badge>
                )}
              </div>
              {profile.user.username && (
                <p className="text-muted-foreground">@{profile.user.username}</p>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-foreground">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold">{profile.followersCount}</span>
                <span className="text-muted-foreground ml-1">Follower</span>
              </div>
              <div>
                <span className="font-semibold">{profile.followingCount}</span>
                <span className="text-muted-foreground ml-1">Seguiti</span>
              </div>
              <div>
                <span className="font-semibold">{profile.postsCount}</span>
                <span className="text-muted-foreground ml-1">Post</span>
              </div>
            </div>

            {/* Location */}
            {profile.city && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {profile.city}
              </div>
            )}

            {/* Social Links */}
            {profile.spotifyUrl && (
              <a
                href={profile.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Music className="w-5 h-5" />
              </a>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <FollowButton
                targetSlug={slug}
                className="flex-1 md:flex-initial"
              />
              <ChatButton
                whatsappNumber={profile.whatsappNumber}
                telegramHandle={profile.telegramHandle}
                className="flex-1 md:flex-initial"
              />
            </div>
          </div>
        </div>

        {/* Interests & Genres */}
        {(profile.interests.length > 0 || profile.favoriteGenres.length > 0) && (
          <div className="mt-8 space-y-4">
            {profile.interests.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold mb-2">Interessi</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.favoriteGenres.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold mb-2">Generi Musicali</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.favoriteGenres.map((genre) => (
                    <Badge key={genre} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
