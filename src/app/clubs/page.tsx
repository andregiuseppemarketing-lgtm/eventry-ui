'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload, MultiImageUpload } from '@/components/image-upload';
import { MultiSelect } from '@/components/multi-select';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin,
  Globe,
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Clock,
  Euro,
  Music,
  Sparkles,
  Calendar,
  Users,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type Club = {
  id: string;
  name: string;
  type: 'DISCOTECA' | 'PUB' | 'LIDO' | 'ALTRO';
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
  _count: {
    venues: number;
  };
  createdAt: string;
};

const CLUB_TYPES = [
  { value: 'DISCOTECA', label: 'Discoteca', icon: '🪩' },
  { value: 'PUB', label: 'Pub', icon: '🍺' },
  { value: 'LIDO', label: 'Lido', icon: '🏖️' },
  { value: 'ALTRO', label: 'Altro', icon: '🏢' },
];

const AMENITIES = [
  'Parcheggio',
  'Wi-Fi Gratis',
  'Aria Condizionata',
  'Area Fumatori',
  'Guardaroba',
  'Area VIP',
  'Servizio Bottiglia',
  'Cucina',
  'Bar Cocktail',
  'Terrazza',
  'Piscina',
  'DJ Booth',
  'Impianto Audio Pro',
  'Luci LED',
  'Videowall',
  'Privé',
];

const MUSIC_GENRES = [
  'House',
  'Techno',
  'Hip Hop',
  'Reggaeton',
  'Commerciale',
  'Dance',
  'EDM',
  'Trap',
  'R&B',
  'Disco',
  'Funk',
  'Latino',
  'Afrobeat',
  'Melodic',
  'Progressive',
];

const PRICE_RANGES = [
  { value: '€', label: '€ - Economico (0-20€)' },
  { value: '€€', label: '€€ - Moderato (20-40€)' },
  { value: '€€€', label: '€€€ - Alto (40-70€)' },
  { value: '€€€€', label: '€€€€ - Lusso (70€+)' },
];

async function fetchClubs() {
  const res = await fetch('/api/clubs');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.data.clubs;
}

export default function ClubsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  
  const [formData, setFormData] = useState<{
    name: string;
    type: 'DISCOTECA' | 'PUB' | 'LIDO' | 'ALTRO';
    description: string;
    logo: string;
    coverImage: string;
    gallery: string[];
    website: string;
    phone: string;
    email: string;
    instagram: string;
    facebook: string;
    openingHours: string;
    priceRange: string;
    amenities: string[];
    musicGenres: string[];
  }>({
    name: '',
    type: 'DISCOTECA',
    description: '',
    logo: '',
    coverImage: '',
    gallery: [],
    website: '',
    phone: '',
    email: '',
    instagram: '',
    facebook: '',
    openingHours: '',
    priceRange: '€€',
    amenities: [],
    musicGenres: [],
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    }
    if (status === 'authenticated' && !['ORGANIZER', 'ADMIN'].includes(session?.user?.role || '')) {
      router.push('/dashboard' as Route);
    }
  }, [status, router, session]);

  const { data: clubs = [], isLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: fetchClubs,
    enabled: !!session?.user && ['ORGANIZER', 'ADMIN'].includes(session?.user?.role || ''),
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data.club;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      setIsCreating(false);
      resetForm();
      toast({
        title: 'Club creato',
        description: 'Il club è stato creato con successo',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const res = await fetch(`/api/clubs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result.data.club;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      setEditingClub(null);
      resetForm();
      toast({
        title: 'Club aggiornato',
        description: 'Le modifiche sono state salvate',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clubs/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
      toast({
        title: 'Club eliminato',
        description: 'Il club è stato eliminato con successo',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'DISCOTECA',
      description: '',
      logo: '',
      coverImage: '',
      gallery: [],
      website: '',
      phone: '',
      email: '',
      instagram: '',
      facebook: '',
      openingHours: '',
      priceRange: '€€',
      amenities: [],
      musicGenres: [],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClub) {
      updateMutation.mutate({ id: editingClub.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (club: Club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      type: club.type,
      description: club.description || '',
      logo: club.logo || '',
      coverImage: club.coverImage || '',
      gallery: club.gallery || [],
      website: club.website || '',
      phone: club.phone || '',
      email: club.email || '',
      instagram: club.instagram || '',
      facebook: club.facebook || '',
      openingHours: club.openingHours || '',
      priceRange: club.priceRange || '€€',
      amenities: club.amenities || [],
      musicGenres: club.musicGenres || [],
    });
    setIsCreating(true);
  };

  const handleDelete = (club: Club) => {
    if (confirm(`Sei sicuro di voler eliminare "${club.name}"?`)) {
      deleteMutation.mutate(club.id);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">I Miei Club</h1>
              <p className="text-muted-foreground">
                Gestisci discoteche, pub e lidi - {clubs.length} {clubs.length === 1 ? 'club' : 'clubs'}
              </p>
            </div>
            <Button onClick={() => {
              setIsCreating(true);
              setEditingClub(null);
              resetForm();
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Club
            </Button>
          </div>
        </div>

        {/* Form creazione/modifica */}
        {isCreating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingClub ? 'Modifica Club' : 'Nuovo Club'}</CardTitle>
              <CardDescription>
                {editingClub ? 'Aggiorna le informazioni del club' : 'Compila tutti i dettagli per creare un nuovo club'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Immagini */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Immagini</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Logo</Label>
                      <ImageUpload
                        value={formData.logo}
                        onChange={(url) => setFormData({ ...formData, logo: url })}
                        onRemove={() => setFormData({ ...formData, logo: '' })}
                        label="Carica Logo"
                        aspectRatio="square"
                      />
                    </div>
                    <div>
                      <Label>Immagine di Copertina</Label>
                      <ImageUpload
                        value={formData.coverImage}
                        onChange={(url) => setFormData({ ...formData, coverImage: url })}
                        onRemove={() => setFormData({ ...formData, coverImage: '' })}
                        label="Carica Copertina"
                        aspectRatio="cover"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Galleria Foto</Label>
                    <MultiImageUpload
                      values={formData.gallery}
                      onChange={(urls) => setFormData({ ...formData, gallery: urls })}
                      maxImages={10}
                    />
                  </div>
                </div>

                {/* Informazioni Base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informazioni Base</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Club *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Paradise Club"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo *</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                        required
                      >
                        {CLUB_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrizione</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrivi il tuo locale, l'atmosfera, cosa lo rende speciale..."
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="openingHours">Orari di Apertura</Label>
                      <Input
                        id="openingHours"
                        value={formData.openingHours}
                        onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                        placeholder="Ven-Sab 23:00-05:00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priceRange">Fascia di Prezzo</Label>
                      <select
                        id="priceRange"
                        value={formData.priceRange}
                        onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                      >
                        {PRICE_RANGES.map((range) => (
                          <option key={range.value} value={range.value}>
                            {range.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contatti */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contatti</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+39 123 456 7890"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="info@club.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Sito Web</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://www.club.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        placeholder="@clubname"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={formData.facebook}
                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                        placeholder="facebook.com/clubname"
                      />
                    </div>
                  </div>
                </div>

                {/* Servizi e Generi */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Servizi e Musica</h3>
                  
                  <MultiSelect
                    options={AMENITIES}
                    selected={formData.amenities}
                    onChange={(amenities) => setFormData({ ...formData, amenities })}
                    label="Servizi e Caratteristiche"
                  />

                  <MultiSelect
                    options={MUSIC_GENRES}
                    selected={formData.musicGenres}
                    onChange={(musicGenres) => setFormData({ ...formData, musicGenres })}
                    label="Generi Musicali"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingClub ? 'Salva Modifiche' : 'Crea Club'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingClub(null);
                      resetForm();
                    }}
                  >
                    Annulla
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista club */}
        {clubs.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nessun Club</h3>
              <p className="text-muted-foreground mb-4">
                Non hai ancora creato nessun club. Inizia ora!
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Crea Primo Club
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {clubs.map((club: Club) => {
              const clubType = CLUB_TYPES.find(t => t.value === club.type);
              return (
                <Card key={club.id} className="glass border border-border hover:shadow-lg transition-all overflow-hidden">
                  {/* Cover Image */}
                  {club.coverImage && (
                    <div className="relative h-48 w-full">
                      <Image 
                        src={club.coverImage} 
                        alt={club.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {club.logo ? (
                          <Image 
                            src={club.logo} 
                            alt={club.name} 
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-lg object-cover border-2 border-background shadow-lg"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-3xl border-2 border-background shadow-lg">
                            {clubType?.icon}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-xl">{club.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            {clubType?.label}
                            {club.priceRange && (
                              <span className="text-primary">• {club.priceRange}</span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(club)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(club)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {club.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {club.description}
                      </p>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {club.openingHours && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{club.openingHours}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{club._count.venues} {club._count.venues === 1 ? 'Venue' : 'Venues'}</span>
                      </div>

                      {club.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{club.phone}</span>
                        </div>
                      )}

                      {club.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{club.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Music Genres */}
                    {club.musicGenres && club.musicGenres.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Music className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {club.musicGenres.slice(0, 3).map((genre) => (
                            <span key={genre} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                              {genre}
                            </span>
                          ))}
                          {club.musicGenres.length > 3 && (
                            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                              +{club.musicGenres.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {club.amenities && club.amenities.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {club.amenities.slice(0, 3).map((amenity) => (
                            <span key={amenity} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs">
                              {amenity}
                            </span>
                          ))}
                          {club.amenities.length > 3 && (
                            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                              +{club.amenities.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Gallery Preview */}
                    {club.gallery && club.gallery.length > 0 && (
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {club.gallery.length} {club.gallery.length === 1 ? 'foto' : 'foto'} in galleria
                        </span>
                      </div>
                    )}

                    {/* Social Links */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      {club.website && (
                        <a 
                          href={club.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Globe className="h-4 w-4" />
                          Sito
                        </a>
                      )}
                      {club.instagram && (
                        <a 
                          href={`https://instagram.com/${club.instagram.replace('@', '')}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </a>
                      )}
                      {club.facebook && (
                        <a 
                          href={`https://${club.facebook}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Facebook className="h-4 w-4" />
                          Facebook
                        </a>
                      )}
                    </div>

                    {/* View Profile Button */}
                    <Link href={`/clubs/${club.id}` as Route} className="block">
                      <Button 
                        variant="default" 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Vedi Profilo Pubblico
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
