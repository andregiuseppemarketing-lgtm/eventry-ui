'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Bell, 
  Edit2, 
  ChevronDown
} from 'lucide-react';
import { OnboardingGuard } from '@/components/onboarding-guard';

interface RoleData {
  type: 'collaborator' | 'founder' | 'pr' | 'artist';
  label: string;
  pageName: string;
  pageSlug: string;
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  stats: {
    followers: number;
    following: number;
    eventsAttended: number;
  };
  roles: RoleData[];
  managedPages: {
    id: string;
    name: string;
    type: string;
  }[];
  hasStories: boolean;
}

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      const loginRedirect = `/auth/login?callbackUrl=${encodeURIComponent('/dashboard/profilo')}` as Route;
      router.push(loginRedirect);
    } else if (status === 'authenticated') {
      loadUserData();
    }
  }, [status, router]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // API call per dati reali dal database
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Errore durante il caricamento del profilo');
      }
      
      const profile = data.data;
      
      // Mock roles temporaneo - TODO: sostituire con API call
      const mockRoles: RoleData[] = [];
      
      if (session?.user?.role === 'PR') {
        mockRoles.push({
          type: 'pr',
          label: 'PR',
          pageName: profile.displayName || `${profile.firstName} ${profile.lastName}`,
          pageSlug: profile.username || 'username'
        });
      }
      
      setUserData({
        id: profile.id,
        firstName: profile.firstName || 'Nome',
        lastName: profile.lastName || 'Cognome',
        username: profile.username || 'username',
        avatarUrl: profile.avatarUrl,
        bio: profile.bio || 'Appassionato di musica e nightlife 🎵✨',
        stats: profile.stats || {
          followers: 0,
          following: 0,
          eventsAttended: 0,
        },
        roles: mockRoles,
        managedPages: [
          // TODO: Query reali
        ],
        hasStories: false,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <LoadingSkeleton />;
  }

  if (!userData) {
    return null;
  }

  return (
    <OnboardingGuard>
      <div className="min-h-screen bg-background text-foreground">
        {/* MENU PRINCIPALE - Header con campanella sx, logo centro, menu dx */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="relative flex items-center justify-between px-4 py-3">
          {/* Campanella notifiche (sinistra) */}
          <Link
            href={"/dashboard/notifiche" as Route}
            className="p-2 hover:bg-accent/10 rounded-full transition relative"
            aria-label="Notifiche"
          >
            <Bell className="w-7 h-7 text-primary" />
            {/* Badge notifiche non lette */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </Link>

          {/* Logo centrale con gradiente - centrato assoluto */}
          <Link href={"/" as Route} className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold tracking-tight gradient-text">
            EVENT
          </Link>

          {/* Menu hamburger (destra) - linea centrale più lunga */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-accent/10 rounded-full transition flex flex-col gap-2 items-end"
            aria-label="Menu"
          >
            <div className="h-0.5 w-7 bg-gradient-to-r from-primary to-accent rounded-full" />
            <div className="h-0.5 w-9 bg-gradient-to-r from-primary to-accent rounded-full" />
            <div className="h-0.5 w-7 bg-gradient-to-r from-primary to-accent rounded-full" />
          </button>
        </div>
      </header>

      {/* DETTAGLI PROFILO */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        
        {/* FOTO PROFILO 3:4 con border gradiente */}
        <div className="flex justify-center mb-4">
          <div className="relative w-24 h-32">
            {/* Border gradiente spesso */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary p-[4px]">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-card">
                {userData.avatarUrl ? (
                  <Image
                    src={userData.avatarUrl}
                    alt={`${userData.firstName} ${userData.lastName}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-4xl font-bold text-muted-foreground bg-muted">
                    {userData.firstName[0]}{userData.lastName[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Stella 4 punte - in basso a DESTRA */}
            <button className="absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center shadow-lg border-[2px] border-background hover:scale-110 transition">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </button>
          </div>
        </div>        {/* NOME E COGNOME + icona modifica */}
        <div className="flex items-center justify-center gap-0.5 relative">
          <h1 className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{ fontSize: '22px', lineHeight: '1' }}>
            {userData.firstName} {userData.lastName}
          </h1>
          <Link
            href={"/dashboard/settings" as Route}
            className="p-1 hover:bg-accent/10 rounded-full transition"
            aria-label="Modifica profilo"
          >
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>

        {/* USERNAME con dropdown */}
        <div className="flex items-center justify-center gap-0.5 relative mt-1">
          <span className="text-muted-foreground" style={{ fontSize: '14px', lineHeight: '1' }}>@{userData.username}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* QUATTRO ELEMENTI IN UNA RIGA: Eventi | Follower | Seguiti | Info */}
        <div className="flex items-center justify-center gap-4 px-4 mt-4">
          {/* Eventi partecipati - Box gradiente viola→blu */}
          <button 
            className="rounded-xl hover:opacity-90 transition flex items-center gap-1.5 px-2.5"
            style={{ 
              width: '150px', 
              height: '26px',
              background: 'linear-gradient(to right, #A855F7, #06B6D4)'
            }}
          >
            {/* Icona calendario 15x15 a sinistra */}
            <svg className="flex-shrink-0" width="15" height="15" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            
            {/* Testo: numero + label */}
            <div className="flex items-center gap-1">
              <span className="font-bold text-white" style={{ fontSize: '17px', lineHeight: '1' }}>{userData.stats.eventsAttended}</span>
              <div className="flex flex-col items-start" style={{ fontSize: '8.5px', lineHeight: '1.1' }}>
                <span className="text-white">presenze</span>
                <span className="text-white">eventi</span>
              </div>
            </div>
          </button>

          {/* Follower - Solo testo, nessun box */}
          <button className="flex flex-col items-center hover:opacity-70 transition">
            <span className="font-bold text-foreground" style={{ fontSize: '17.5px', lineHeight: '1' }}>
              {userData.stats.followers.toLocaleString()}
            </span>
            <span className="text-foreground/70 mt-0.5" style={{ fontSize: '11.25px', lineHeight: '1' }}>
              Follower
            </span>
          </button>

          {/* Seguiti - Solo testo, nessun box */}
          <button className="flex flex-col items-center hover:opacity-70 transition">
            <span className="font-bold text-foreground" style={{ fontSize: '17.5px', lineHeight: '1' }}>
              {userData.stats.following}
            </span>
            <span className="text-foreground/70 mt-0.5" style={{ fontSize: '11.25px', lineHeight: '1' }}>
              Seguiti
            </span>
          </button>

          {/* Info - Box gradiente blu→viola */}
          <button 
            className="rounded-xl hover:opacity-90 transition flex items-center gap-1.5 px-2.5"
            style={{ 
              width: '150px', 
              height: '26px',
              background: 'linear-gradient(to right, #06B6D4, #A855F7)'
            }}
          >
            {/* Icona info 15x15 a sinistra */}
            <svg className="flex-shrink-0" width="15" height="15" fill="white" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            
            {/* Testo INFO */}
            <span className="font-bold text-white" style={{ fontSize: '17px', lineHeight: '1' }}>
              INFO
            </span>
          </button>
        </div>

        {/* BIO - Sotto i tasti */}
        <div className="px-4 mt-6">
          {/* Ruoli con handle clickabili */}
          <div className="text-sm leading-none space-y-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-semibold text-foreground">Founder</span>
              <a href="/sudcafe" className="text-primary hover:underline">@Sudcafè</a>
              <span className="text-foreground/50">/</span>
              <a href="/sudinthecity" className="text-primary hover:underline">@Sudinthecity</a>
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-semibold text-foreground">Founder</span>
              <a href="/panicogroup" className="text-primary hover:underline">@PanicoGroup</a>
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-semibold text-foreground">PR</span>
              <a href="/fonzieeventi" className="text-primary hover:underline">@FonzieEventi</a>
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-semibold text-foreground">DJ</span>
              <a href="/fonziemusic" className="text-primary hover:underline">@FonzieMusic</a>
            </div>
          </div>
          
          {/* Testo bio */}
          <p className="text-foreground mt-1 leading-tight" style={{ fontSize: '12px' }}>
            My names is Andrea Granata but everybody calls me FONZIE
          </p>
        </div>

        {/* Divisore */}
        <div className="h-px bg-border mt-6" />

        {/* TODO: Seconda parte del profilo - feed contenuti */}
      </div>

      {/* BOTTOM NAVIGATION - 4 icone */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
        <div className="flex items-center justify-around px-6 py-3 max-w-2xl mx-auto">
          <Link href={"/dashboard/profilo" as Route} className="p-3 text-primary hover:bg-accent/10 rounded-full transition">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-accent" />
          </Link>
          <Link href={"/eventi" as Route} className="p-3 text-muted-foreground hover:text-primary hover:bg-accent/10 rounded-full transition">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
          </Link>
          <Link href={"/search" as Route} className="p-3 text-muted-foreground hover:text-primary hover:bg-accent/10 rounded-full transition">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
          <Link href={"/qr-scanner" as Route} className="p-3 text-muted-foreground hover:text-primary hover:bg-accent/10 rounded-full transition">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd"/>
              <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 10-2 0v1a1 1 0 002 0v-1zM17 11a1 1 0 10-2 0v1a1 1 0 002 0v-1zM16 13a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z"/>
            </svg>
          </Link>
        </div>
      </nav>
    </div>
    </OnboardingGuard>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
          <div className="w-20 h-6 bg-muted rounded animate-pulse" />
          <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Profile skeleton */}
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        <div className="flex justify-center">
          <div className="w-32 h-24 bg-card rounded-2xl animate-pulse" />
        </div>
        <div className="flex justify-center">
          <div className="h-6 w-32 bg-card rounded animate-pulse" />
        </div>
        <div className="flex justify-center gap-6">
          <div className="h-12 w-20 bg-card rounded animate-pulse" />
          <div className="h-12 w-20 bg-card rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
