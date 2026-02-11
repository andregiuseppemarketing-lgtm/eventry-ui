'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { 
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Clock,
  Euro,
  Users,
  Star,
  Calendar,
  Music2,
  Shield,
  Car,
  MessageCircle,
  UserPlus,
  Sparkles,
  TrendingUp,
  Instagram,
  Play,
  ChevronRight,
  Navigation,
  Info,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { StoriesHighlights } from '@/components/stories-highlights';
import { DJLineup } from '@/components/dj-lineup';
import { CommunitySection } from '@/components/community-section';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

type ClubEvent = {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  date: string;
  dateStart: string;
  venue: {
    name: string;
  };
  musicGenres?: string[];
  priceRange?: string;
  status: string;
};

type Club = {
  id: string;
  name: string;
  type: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  gallery?: string[];
  website?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  openingHours?: string;
  priceRange?: string;
  amenities?: string[];
  musicGenres?: string[];
  venues?: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    capacity?: number;
  }>;
  _count?: {
    venues: number;
  };
};

async function fetchClubDetails(id: string) {
  const res = await fetch(`/api/clubs/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.data.club;
}

async function fetchClubEvents(clubId: string) {
  // TODO: Implementare API per eventi filtrati per club
  const res = await fetch('/api/events');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.data.events || [];
}

export default function ClubProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'eventi' | 'gallery' | 'info'>('eventi');

  const { data: club, isLoading } = useQuery<Club>({
    queryKey: ['club', params.id],
    queryFn: () => fetchClubDetails(params.id as string),
  });

  const { data: events = [] } = useQuery<ClubEvent[]>({
    queryKey: ['club-events', params.id],
    queryFn: () => fetchClubEvents(params.id as string),
  });

  const upcomingEvents = events.filter((e: ClubEvent) => 
    new Date(e.dateStart) > new Date() && e.status === 'PUBLISHED'
  ).slice(0, 5);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? 'Non segui più questo locale' : 'Ora segui questo locale!',
      description: isFollowing ? '' : 'Riceverai notifiche sui nuovi eventi',
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: club?.name,
        text: club?.description || `Scopri ${club?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copiato!' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Club non trovato</h2>
          <Button onClick={() => router.back()}>Torna indietro</Button>
        </div>
      </div>
    );
  }

  const mainVenue = club.venues?.[0];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section con Cover Image */}
      <div className="relative h-[60vh] min-h-[400px] w-full">
        {/* Cover Image */}
        <div className="absolute inset-0">
          {club.coverImage ? (
            <Image
              src={club.coverImage}
              alt={club.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Club Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="flex items-end gap-4">
            {/* Logo */}
            {club.logo && (
              <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-2xl overflow-hidden flex-shrink-0 bg-white">
                <Image
                  src={club.logo}
                  alt={club.name}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-black text-white mb-1 drop-shadow-lg">
                {club.name}
              </h1>
              {club.description && (
                <p className="text-white/90 text-sm font-medium drop-shadow-md line-clamp-2">
                  {club.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                {club.musicGenres && club.musicGenres.length > 0 && (
                  <span className="text-xs font-semibold text-white/80 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                    {club.musicGenres[0]}
                  </span>
                )}
                {club.priceRange && (
                  <span className="text-xs font-semibold text-white/80 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                    {club.priceRange}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA Bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-2">
            <Button
              size="sm"
              onClick={handleFollow}
              variant={isFollowing ? 'outline' : 'default'}
              className="text-xs"
            >
              <Heart className={`w-4 h-4 mr-1 ${isFollowing ? 'fill-current' : ''}`} />
              {isFollowing ? 'Segui' : 'Segui'}
            </Button>
            <Button size="sm" className="text-xs bg-gradient-to-r from-purple-600 to-pink-600">
              <UserPlus className="w-4 h-4 mr-1" />
              Lista
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <Calendar className="w-4 h-4 mr-1" />
              Tavolo
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <MessageCircle className="w-4 h-4 mr-1" />
              Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-8">
        
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <div className="text-xs text-muted-foreground">Eventi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">12.5K</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">4.8</span>
            </div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
        </div>

        {/* Stories Highlights */}
        <section>
          <h2 className="text-xl font-bold mb-4">Highlights</h2>
          <StoriesHighlights
            clubName={club.name}
            stories={[
              {
                id: '1',
                category: 'Lista & Tavoli',
                icon: '📋',
                image: club.gallery?.[0] || '',
                title: 'Come prenotare',
              },
              {
                id: '2',
                category: 'DJ & Artisti',
                icon: '🎧',
                image: club.gallery?.[1] || '',
                title: 'I nostri DJ',
              },
              {
                id: '3',
                category: 'Video Serate',
                icon: '🎬',
                image: club.gallery?.[2] || '',
                title: 'Le nostre serate',
              },
              {
                id: '4',
                category: 'Location',
                icon: '🏛️',
                image: club.gallery?.[3] || '',
                title: 'Il locale',
              },
              {
                id: '5',
                category: 'Info & Regole',
                icon: 'ℹ️',
                image: club.gallery?.[4] || '',
                title: 'Informazioni utili',
              },
            ]}
          />
        </section>

        {/* Prossimi Eventi */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Prossimi Eventi</h2>
            <Link
              href={`/clubs/${club.id}/eventi` as Route}
              className="text-sm text-primary hover:underline"
            >
              Vedi tutti
            </Link>
          </div>
          
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Nessun evento in programma</p>
              </Card>
            ) : (
              upcomingEvents.map((event: ClubEvent) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex gap-4 p-4">
                    {/* Event Cover */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                      {event.coverImage && (
                        <Image
                          src={event.coverImage}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      )}
                      {/* Date Badge */}
                      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded-lg px-2 py-1 text-center">
                        <div className="text-xs font-bold text-white leading-none">
                          {format(parseISO(event.dateStart), 'd', { locale: it })}
                        </div>
                        <div className="text-[10px] text-white/70 leading-none mt-0.5">
                          {format(parseISO(event.dateStart), 'MMM', { locale: it })}
                        </div>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base line-clamp-1 mb-1">
                        {event.title}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{format(parseISO(event.dateStart), 'EEEE, d MMMM • HH:mm', { locale: it })}</span>
                        </div>
                        {event.musicGenres && event.musicGenres.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Music2 className="w-3 h-3" />
                            <span>{event.musicGenres.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="flex-1 h-8 text-xs">
                          Entra in Lista
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          Info
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Gallery Feed */}
        {club.gallery && club.gallery.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Gallery</h2>
              <button className="text-sm text-primary hover:underline">
                Vedi tutte
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {club.gallery.slice(0, 6).map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${club.name} foto ${index + 1}`}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-300"
                  />
                  {index === 5 && club.gallery!.length > 6 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        +{club.gallery!.length - 6}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Generi Musicali */}
        {club.musicGenres && club.musicGenres.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Generi Musicali</h2>
            <div className="flex flex-wrap gap-2">
              {club.musicGenres.map((genre) => (
                <span
                  key={genre}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-sm font-medium"
                >
                  {genre}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* DJ & Artisti */}
        <section>
          <h2 className="text-xl font-bold mb-4">DJ & Artisti</h2>
          <DJLineup
            djs={[
              {
                id: '1',
                name: 'Marco Rossi',
                stageName: 'DJ Rossi',
                avatar: '',
                bio: 'Resident DJ dal 2019, specializzato in House e Techno',
                genres: ['House', 'Techno', 'Tech House'],
                instagramUrl: 'https://instagram.com/djrossi',
                spotifyUrl: 'https://open.spotify.com/artist/example',
                isResident: true,
              },
              {
                id: '2',
                name: 'Sara Bianchi',
                stageName: 'Sarah B',
                avatar: '',
                bio: 'Producer e DJ, resident dal 2020',
                genres: ['Afro House', 'Melodic Techno'],
                instagramUrl: 'https://instagram.com/sarahb',
                spotifyUrl: 'https://open.spotify.com/artist/example2',
                isResident: true,
              },
              {
                id: '3',
                name: 'Andrea Verdi',
                stageName: 'A-Verde',
                avatar: '',
                bio: 'Guest DJ internazionale, tour mondiale 2024',
                genres: ['Progressive House', 'Trance'],
                instagramUrl: 'https://instagram.com/averde',
                spotifyUrl: 'https://open.spotify.com/artist/example3',
                isResident: false,
              },
            ]}
          />
        </section>

        {/* Servizi */}
        {club.amenities && club.amenities.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Servizi</h2>
            <div className="grid grid-cols-2 gap-3">
              {club.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 p-3 rounded-lg bg-accent/50"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{amenity}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Community */}
        <section>
          <h2 className="text-xl font-bold mb-4">Community</h2>
          <CommunitySection
            followersCount={12500}
            friendsFollowing={[
              { id: '1', name: 'Giulia', avatar: '' },
              { id: '2', name: 'Marco', avatar: '' },
              { id: '3', name: 'Sara', avatar: '' },
              { id: '4', name: 'Luca', avatar: '' },
              { id: '5', name: 'Anna', avatar: '' },
            ]}
            upcomingAttendees={1240}
            officialPRs={[
              {
                id: '1',
                name: 'Alessandro Neri',
                role: 'Senior PR',
                avatar: '',
                phone: '+39 333 1234567',
              },
              {
                id: '2',
                name: 'Martina Rossi',
                role: 'PR & Events',
                avatar: '',
                phone: '+39 333 7654321',
              },
            ]}
            badges={['Top Locale Weekend', 'Più Seguito della Zona', '1000+ Recensioni']}
          />
        </section>

        {/* Info Utili */}
        <section>
          <h2 className="text-xl font-bold mb-4">Informazioni Utili</h2>
          <Card className="divide-y">
            {mainVenue && (
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Posizione</div>
                    <div className="text-sm text-muted-foreground">
                      {mainVenue.address}, {mainVenue.city}
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            )}

            {club.openingHours && (
              <div className="p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">Orari</div>
                  <div className="text-sm text-muted-foreground">{club.openingHours}</div>
                </div>
              </div>
            )}

            {club.phone && (
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium">Contatti</div>
                    <div className="text-sm text-muted-foreground">{club.phone}</div>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">Età minima</div>
                <div className="text-sm text-muted-foreground">18 anni</div>
              </div>
            </div>

            <div className="p-4 flex items-center gap-3">
              <Car className="w-5 h-5 text-primary" />
              <div>
                <div className="font-medium">Parcheggio</div>
                <div className="text-sm text-muted-foreground">Disponibile nelle vicinanze</div>
              </div>
            </div>
          </Card>
        </section>

        {/* Social Links */}
        {(club.instagram || club.facebook || club.website) && (
          <section>
            <h2 className="text-xl font-bold mb-4">Seguici</h2>
            <div className="flex gap-3">
              {club.instagram && (
                <a
                  href={`https://instagram.com/${club.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </Button>
                </a>
              )}
              {club.website && (
                <a
                  href={club.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    Sito Web
                  </Button>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Recensioni Preview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recensioni</h2>
            <button className="text-sm text-primary hover:underline">
              Vedi tutte
            </button>
          </div>
          
          <Card className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold">4.8</div>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">326 recensioni</div>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs w-3">{stars}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${stars === 5 ? 80 : stars === 4 ? 15 : 5}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Scrivi una recensione
            </Button>
          </Card>
        </section>

      </div>

      {/* Floating Chat Button */}
      <button
        className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        onClick={() => {
          // TODO: Aprire modal chat con PR
          alert('Chat con PR - Coming soon!')
        }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 z-20">
        <div className="container mx-auto flex gap-3">
          <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Entra in Lista
          </Button>
          <Button variant="outline" className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Prenota Tavolo
          </Button>
        </div>
      </div>
    </div>
  );
}
