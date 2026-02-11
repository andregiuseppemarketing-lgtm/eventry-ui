'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TelegramConnectProps {
  guestId: string;
  telegramChatId?: string | null;
  botUsername?: string; // Default: panico_events_bot
}

export function TelegramConnect({ 
  guestId, 
  telegramChatId,
  botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'panico_events_bot'
}: TelegramConnectProps) {
  const [isConnected, setIsConnected] = useState(!!telegramChatId);
  const telegramDeepLink = `https://t.me/${botUsername}?start=guest_${guestId}`;

  useEffect(() => {
    setIsConnected(!!telegramChatId);
  }, [telegramChatId]);

  if (isConnected) {
    return (
      <Card className="glass border-green-500/30 bg-green-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-500/20 p-2">
            <Check className="h-5 w-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-green-400">Telegram Collegato</h4>
            <p className="text-sm text-muted-foreground">
              Riceverai notifiche su Telegram
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass border-border p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="font-medium">Collega Telegram</h4>
            <p className="text-sm text-muted-foreground">
              Ricevi notifiche immediate per biglietti, check-in e promemoria eventi
            </p>
          </div>
          
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-400" />
              <span>🎫 Conferma biglietti con QR code</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-400" />
              <span>⏰ Promemoria eventi</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-400" />
              <span>🎉 Offerte esclusive</span>
            </div>
          </div>

          <Button
            asChild
            className="btn-primary w-full"
          >
            <a
              href={telegramDeepLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Collega Telegram
            </a>
          </Button>

          <p className="text-xs text-muted-foreground/70">
            Cliccando il bottone verrai reindirizzato a Telegram. Premi "Start" per completare il collegamento.
          </p>
        </div>
      </div>
    </Card>
  );
}

// Componente per WhatsApp (preparato per futuro)
interface WhatsAppConnectProps {
  guestId: string;
  whatsappPhone?: string | null;
}

export function WhatsAppConnect({ guestId, whatsappPhone }: WhatsAppConnectProps) {
  const [isConnected, setIsConnected] = useState(!!whatsappPhone);

  if (isConnected) {
    return (
      <Card className="glass border-green-500/30 bg-green-500/5 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-500/20 p-2">
            <Check className="h-5 w-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-green-400">WhatsApp Collegato</h4>
            <p className="text-sm text-muted-foreground">
              {whatsappPhone}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50 bg-muted/30 p-4 opacity-60">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-muted p-2">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium">WhatsApp</h4>
          <p className="text-sm text-muted-foreground">
            Disponibile prossimamente
          </p>
        </div>
      </div>
    </Card>
  );
}

// Componente combinato per mostrare entrambe le opzioni
interface MessagingConnectProps {
  guestId: string;
  telegramChatId?: string | null;
  whatsappPhone?: string | null;
}

export function MessagingConnect({ 
  guestId, 
  telegramChatId, 
  whatsappPhone 
}: MessagingConnectProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Notifiche Messaggi</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Collega Telegram o WhatsApp per ricevere notifiche istantanee
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TelegramConnect 
          guestId={guestId} 
          telegramChatId={telegramChatId} 
        />
        <WhatsAppConnect 
          guestId={guestId} 
          whatsappPhone={whatsappPhone} 
        />
      </div>
    </div>
  );
}
