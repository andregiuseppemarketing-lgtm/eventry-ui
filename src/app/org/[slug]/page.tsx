import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ChatButton } from '@/components/chat-button';
import { Badge } from '@/components/ui/badge';
import { Globe, CheckCircle2, Users, Calendar, Instagram, Facebook, Twitter } from 'lucide-react';
import Image from 'next/image';

interface OrganizationPageProps {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { slug } = await params;

  const org = await prisma.organizationProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      teamMembers: true,
    },
  });

  if (!org) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      {org.coverImage && (
        <div className="relative h-64 w-full bg-gradient-to-b from-primary/20 to-background">
          <Image
            src={org.coverImage}
            alt="Cover"
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start -mt-20 md:-mt-16">
          {/* Logo */}
          <div className="relative">
            <div className="w-32 h-32 rounded-lg border-4 border-background bg-card overflow-hidden shadow-xl">
              {org.logo ? (
                <Image
                  src={org.logo}
                  alt={org.organizationName}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                  {org.organizationName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold">{org.organizationName}</h1>
                {org.verified && (
                  <Badge variant="default" className="gap-1 bg-blue-600">
                    <CheckCircle2 className="w-3 h-3" />
                    Verificato
                  </Badge>
                )}
              </div>
              {org.user.username && (
                <p className="text-muted-foreground">@{org.user.username}</p>
              )}
            </div>

            {/* Bio */}
            {org.bio && (
              <p className="text-foreground">{org.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold">{org.totalEvents}</span>
                <span className="text-muted-foreground ml-1">Eventi</span>
              </div>
              <div>
                <span className="font-semibold">{org.totalAttendees.toLocaleString()}</span>
                <span className="text-muted-foreground ml-1">Partecipanti</span>
              </div>
              {org.teamMembers.length > 0 && (
                <div>
                  <span className="font-semibold">{org.teamMembers.length}</span>
                  <span className="text-muted-foreground ml-1">Team</span>
                </div>
              )}
            </div>

            {/* Website */}
            {org.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {org.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {/* Social Links */}
            <div className="flex gap-3">
              {org.instagram && (
                <a
                  href={`https://instagram.com/${org.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {org.facebook && (
                <a
                  href={org.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {org.twitter && (
                <a
                  href={org.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Chat Button */}
            <ChatButton
              whatsappNumber={org.whatsappNumber}
              telegramHandle={org.telegramHandle}
              className="w-full md:w-auto"
            />
          </div>
        </div>

        {/* Team Members */}
        {org.teamMembers.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {org.teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-lg border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    {member.avatar ? (
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-semibold">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  {member.email && (
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
