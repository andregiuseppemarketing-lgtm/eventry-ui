'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, Link as LinkIcon } from 'lucide-react';

interface SlugEditorProps {
  currentSlug?: string | null;
  onUpdate?: (newSlug: string) => void;
}

export function SlugEditor({ currentSlug, onUpdate }: SlugEditorProps) {
  const [slug, setSlug] = useState(currentSlug || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile/slug', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'aggiornamento');
      }

      toast({
        title: '✅ Slug aggiornato',
        description: `Il tuo profilo è ora disponibile su: ${data.url}`,
      });

      if (onUpdate) {
        onUpdate(data.slug);
      }
    } catch (error) {
      toast({
        title: '❌ Errore',
        description: error instanceof Error ? error.message : 'Impossibile aggiornare lo slug',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const previewUrl = slug ? `/u/${slug}` : '/u/...';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="slug">
          URL Personalizzato
        </Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="mario-rossi"
              pattern="[a-z0-9-]+"
              minLength={3}
              maxLength={50}
              required
              className="pl-10"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading || !slug || slug === currentSlug}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span className="ml-2">Salva</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Il tuo profilo sarà disponibile su: <span className="font-mono text-primary">{previewUrl}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          ℹ️ Usa solo lettere minuscole, numeri e trattini (3-50 caratteri)
        </p>
      </div>
    </form>
  );
}
