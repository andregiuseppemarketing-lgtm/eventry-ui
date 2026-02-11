'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Clock, FileText, Upload, X, Map } from 'lucide-react';
import Image from 'next/image';

type Venue = {
  id: string;
  name: string;
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
};

export default function NewEventPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueId: '',
    latitude: '',
    longitude: '',
    dateStart: '',
    dateEnd: '',
    coverUrl: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    }
  }, [status, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Controllo dimensione (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'immagine deve essere inferiore a 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Per ora convertiamo in base64 (in produzione usare un servizio di storage)
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, coverUrl: base64String }));
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Errore durante il caricamento dell\'immagine');
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, coverUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openGoogleMaps = () => {
    const address = encodeURIComponent(`${formData.venueAddress}, ${formData.venueCity}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Prima crea la venue se non esiste
      let venueId = '';
      
      const venueRes = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.venueName,
          address: formData.venueAddress,
          city: formData.venueCity,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        }),
      });

      if (venueRes.ok) {
        const venueData = await venueRes.json();
        venueId = venueData.data.id;
      } else {
        throw new Error('Errore nella creazione della location');
      }

      // Poi crea l'evento
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          venueId,
          dateStart: new Date(formData.dateStart).toISOString(),
          dateEnd: formData.dateEnd ? new Date(formData.dateEnd).toISOString() : null,
          coverUrl: formData.coverUrl,
          status: formData.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la creazione');
      }

      router.push('/dashboard' as Route);
    } catch (err: any) {
      setError(err.message || 'Errore durante la creazione dell\'evento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Gradienti animati di sfondo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group mb-6"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Torna alla dashboard
            </Link>
            
            <h1 className="text-4xl font-semibold tracking-tight gradient-text">Crea Nuovo Evento</h1>
            <p className="mt-3 text-muted-foreground">
              Compila i dettagli del tuo evento per iniziare a gestire ospiti e biglietti
            </p>
          </div>

          {/* Form Card */}
          <div className="glass border border-border rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            {error && (
              <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titolo */}
              <div className="space-y-2">
                <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileText className="w-4 h-4 text-primary" />
                  Titolo Evento
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="es. Festa di Capodanno 2026"
                  className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                />
              </div>

              {/* Descrizione */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Descrizione
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Descrivi l'evento..."
                  className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)] resize-none"
                />
              </div>

              {/* Upload Locandina */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Locandina Evento
                </label>
                
                {!imagePreview ? (
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="coverImage"
                    />
                    <label
                      htmlFor="coverImage"
                      className="group flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-border glass cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                    >
                      <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {uploadingImage ? 'Caricamento...' : 'Clicca per caricare la locandina'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG, GIF fino a 5MB
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden glass">
                      <Image
                        src={imagePreview}
                        alt="Anteprima locandina"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Location con Google Maps */}
              <div className="space-y-4 glass border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    Location Evento
                  </label>
                  {formData.venueAddress && formData.venueCity && (
                    <button
                      type="button"
                      onClick={openGoogleMaps}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <Map className="w-4 h-4" />
                      Visualizza su Maps
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="venueName" className="text-sm font-medium text-foreground">
                      Nome Locale
                    </label>
                    <input
                      id="venueName"
                      name="venueName"
                      type="text"
                      value={formData.venueName}
                      onChange={handleChange}
                      required
                      placeholder="es. Club XYZ"
                      className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="venueCity" className="text-sm font-medium text-foreground">
                      Città
                    </label>
                    <input
                      id="venueCity"
                      name="venueCity"
                      type="text"
                      value={formData.venueCity}
                      onChange={handleChange}
                      required
                      placeholder="es. Milano"
                      className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="venueAddress" className="text-sm font-medium text-foreground">
                    Indirizzo Completo
                  </label>
                  <input
                    id="venueAddress"
                    name="venueAddress"
                    type="text"
                    value={formData.venueAddress}
                    onChange={handleChange}
                    required
                    placeholder="es. Via Roma 123"
                    className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="latitude" className="text-sm font-medium text-foreground">
                      Latitudine (opzionale)
                    </label>
                    <input
                      id="latitude"
                      name="latitude"
                      type="text"
                      value={formData.latitude}
                      onChange={handleChange}
                      placeholder="es. 45.4642"
                      className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="longitude" className="text-sm font-medium text-foreground">
                      Longitudine (opzionale)
                    </label>
                    <input
                      id="longitude"
                      name="longitude"
                      type="text"
                      value={formData.longitude}
                      onChange={handleChange}
                      placeholder="es. 9.1900"
                      className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  💡 Inserisci le coordinate per una localizzazione precisa su Google Maps
                </p>
              </div>

              {/* Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="dateStart" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    Data Inizio
                  </label>
                  <input
                    id="dateStart"
                    name="dateStart"
                    type="datetime-local"
                    value={formData.dateStart}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dateEnd" className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    Data Fine (opzionale)
                  </label>
                  <input
                    id="dateEnd"
                    name="dateEnd"
                    type="datetime-local"
                    value={formData.dateEnd || ''}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                  />
                </div>
              </div>

              {/* Cover URL */}
              <div className="space-y-2">
                <label htmlFor="coverUrl" className="text-sm font-medium text-foreground">
                  Immagine Copertina (URL)
                </label>
                <input
                  id="coverUrl"
                  name="coverUrl"
                  type="url"
                  value={formData.coverUrl || ''}
                  onChange={handleChange}
                  placeholder="https://esempio.com/immagine.jpg"
                  className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-foreground">
                  Stato
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                >
                  <option value="DRAFT">Bozza</option>
                  <option value="PUBLISHED">Pubblicato</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Gli eventi in bozza non sono visibili pubblicamente
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-ghost flex-1"
                  disabled={loading}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Creazione...' : 'Crea Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
