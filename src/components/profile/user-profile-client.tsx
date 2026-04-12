'use client';

import { useEffect, useState } from 'react';
import { ProfileLayout } from '@/components/profile/profile-layout';
import { ProfileCTABar } from '@/components/profile/profile-cta-bar';
import { ProfileTabNavigation } from '@/components/profile/profile-tab-navigation';
import { EventsTab } from '@/components/profile/tabs/events-tab';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface UserProfileClientProps {
  slug: string;
  currentUserId?: string;
}

interface UserProfile {
  id: string;
  name: string | null;
  slug: string;
  bio: string | null;
  avatar: string | null;
  coverImage: string | null;
  whatsappNumber: string | null;
  telegramHandle: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

interface Event {
  id: string;
  title: string;
  coverUrl?: string | null;
  dateStart: string;
  dateEnd?: string | null;
  status: string;
  ticketType?: string | null;
  venue?: {
    name: string;
    city?: string | null;
  } | null;
  _count?: {
    tickets?: number;
  };
}

/**
 * Client component for user profile with Sprint 1 architecture
 */
export function UserProfileClient({ slug, currentUserId }: UserProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'eventi' | 'attivita' | 'connessioni'>('eventi');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [futureEvents, setFutureEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const isOwner = currentUserId === profile?.id;

  useEffect(() => {
    fetchProfile();
    fetchEvents();
  }, [slug]);

  const fetchProfile = async () => {
    try {
      setError(null);
      const res = await fetch(`/api/user/${slug}`);
      const data = await res.json();
      
      if (data && !data.error) {
        setProfile(data);
      } else {
        setError(data.error || 'Profilo non trovato');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Errore di connessione');
      setIsLoading(false);
    }
  };

  const fetchEvents = async (loadMore = false) => {
    try {
      setIsLoading(!loadMore);
      const currentPage = loadMore ? page + 1 : 1;
      const res = await fetch(`/api/user/${slug}/events?page=${currentPage}&limit=10`);
      const data = await res.json();
      
      if (data.success && data.data) {
        if (loadMore) {
          setFutureEvents(prev => [...prev, ...data.data.futureEvents]);
          setPastEvents(prev => [...prev, ...data.data.pastEvents]);
          setPage(currentPage);
        } else {
          setFutureEvents(data.data.futureEvents);
          setPastEvents(data.data.pastEvents);
          setPage(1);
        }
        setHasMore(data.data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    // TODO: Implement follow/unfollow API call
    setIsFollowing(!isFollowing);
  };

  const handleLoadMore = async () => {
    await fetchEvents(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-6xl">😕</div>
        <h1 className="text-2xl font-bold">Profilo non trovato</h1>
        <p className="text-muted-foreground text-center max-w-md">
          {error}
        </p>
        <a href="/feed" className="text-primary hover:underline">
          Torna alla Home
        </a>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Caricamento profilo...</p>
        </div>
      </div>
    );
  }

  // Header component
  const header = (
    <div className="bg-background border-b border-border">
      {/* Avatar + Info */}
      <div className="px-4 py-6 space-y-4">
        {/* Avatar */}
        <div className="flex items-start justify-between">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.name || 'User'}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Name + Badge */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verificato
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">@{profile.slug}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-foreground">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex gap-6 text-sm">
          <div>
            <span className="font-semibold">{futureEvents.length + pastEvents.length}</span>
            <span className="text-muted-foreground ml-1">Eventi</span>
          </div>
          <div>
            <span className="font-semibold">{profile.followersCount}</span>
            <span className="text-muted-foreground ml-1">Follower</span>
          </div>
          <div>
            <span className="font-semibold">{profile.followingCount}</span>
            <span className="text-muted-foreground ml-1">Seguiti</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ctaBar = (
    <ProfileCTABar
      isOwner={isOwner}
      isFollowing={isFollowing}
      onFollowToggle={handleFollowToggle}
      userSlug={slug}
      whatsappNumber={profile.whatsappNumber}
      telegramHandle={profile.telegramHandle}
    />
  );

  const tabBar = (
    <ProfileTabNavigation
      activeTab={activeTab}
      onTabChange={setActiveTab}
      eventsCount={futureEvents.length + pastEvents.length}
    />
  );

  const content = (
    <div>
      {activeTab === 'eventi' && (
        <EventsTab
          futureEvents={futureEvents}
          pastEvents={pastEvents}
          isLoading={isLoading}
          isOwner={isOwner}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      )}
      {activeTab === 'attivita' && (
        <div className="py-16 text-center text-muted-foreground">
          Tab Attività in arrivo nei prossimi sprint
        </div>
      )}
      {activeTab === 'connessioni' && (
        <div className="py-16 text-center text-muted-foreground">
          Tab Connessioni in arrivo nei prossimi sprint
        </div>
      )}
    </div>
  );

  return (
    <ProfileLayout
      header={header}
      ctaBar={ctaBar}
      tabBar={tabBar}
      content={content}
    >
      {null}
    </ProfileLayout>
  );
}
