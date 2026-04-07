'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useEventContext } from '@/hooks/use-event-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, ChevronDown, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  dateStart: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  venue?: {
    name: string;
    city?: string | null;
  } | null;
}

interface EventSelectorProps {
  position?: 'navbar' | 'toolbar' | 'inline';
  showLabel?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * EventSelector
 * 
 * Dropdown per selezionare evento attivo.
 * Filtra eventi per ruolo utente.
 * Sync automatico con EventContext.
 */
export function EventSelector({
  position = 'navbar',
  showLabel = true,
  placeholder = 'Seleziona evento...',
  className,
}: EventSelectorProps) {
  const { data: session } = useSession();
  const { selectedEvent, selectEvent, clearEvent, isLoading: contextLoading } = useEventContext();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Fetch eventi accessibili per ruolo
  useEffect(() => {
    if (!session) return;

    async function fetchEvents() {
      setIsLoadingEvents(true);
      try {
        const res = await fetch('/api/events');
        if (!res.ok) throw new Error('Failed to fetch events');
        
        const data = await res.json();
        const fetchedEvents = data.events || data.data?.events || [];
        
        // Filtra per ruolo (per ora mostriamo tutti, filtro backend gestisce ACL)
        // In futuro si può aggiungere logica client-side
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    }

    fetchEvents();
  }, [session]);

  const isLoading = contextLoading || isLoadingEvents;

  // Layout variants
  const isCompact = position === 'navbar';
  const buttonClassName = cn(
    'gap-2',
    isCompact ? 'h-9' : 'h-10',
    className
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={buttonClassName}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="max-w-[200px] truncate">Caricamento...</span>
            </>
          ) : selectedEvent ? (
            <>
              <Calendar className="h-4 w-4" />
              <span className="max-w-[200px] truncate">
                {showLabel && position !== 'navbar' && (
                  <span className="text-muted-foreground mr-1">Evento:</span>
                )}
                {selectedEvent.title}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              <span className="max-w-[200px] truncate">{placeholder}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[320px]">
        <DropdownMenuLabel>
          {events.length > 0 ? 'Seleziona Evento' : 'Nessun evento disponibile'}
        </DropdownMenuLabel>
        
        {events.length > 0 && (
          <>
            <DropdownMenuSeparator />
            
            <div className="max-h-[400px] overflow-y-auto">
              {events.map((event) => {
                const isSelected = selectedEvent?.id === event.id;
                const dateStart = parseISO(event.dateStart);
                
                return (
                  <DropdownMenuItem
                    key={event.id}
                    onClick={() => selectEvent(event.id)}
                    className={cn(
                      'flex flex-col items-start gap-1 py-3 cursor-pointer',
                      isSelected && 'bg-accent'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{event.title}</span>
                      {isSelected && (
                        <span className="text-xs text-primary">✓ Attivo</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {format(dateStart, 'd MMM yyyy', { locale: it })}
                      </span>
                      {event.venue && (
                        <>
                          <span>•</span>
                          <span>{event.venue.name}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {event.status === 'DRAFT' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Bozza
                        </span>
                      )}
                      {event.status === 'PUBLISHED' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Pubblicato
                        </span>
                      )}
                      {event.status === 'CANCELLED' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                          Annullato
                        </span>
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
            
            {selectedEvent && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={clearEvent}
                  className="text-muted-foreground"
                >
                  Deseleziona evento
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem asChild>
          <Link href={'/eventi/nuovo' as Route} className="cursor-pointer">
            <span className="font-medium">+ Crea Nuovo Evento</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
