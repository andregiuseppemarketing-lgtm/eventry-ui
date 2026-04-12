'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, MoreVertical, Edit2, Share2, QrCode, Flag, Ban } from 'lucide-react';
import Link from 'next/link';

interface ProfileCTABarProps {
  isOwner: boolean;
  isFollowing?: boolean;
  onFollowToggle?: () => void;
  userSlug: string;
  whatsappNumber?: string | null;
  telegramHandle?: string | null;
}

/**
 * CTA Bar con logica visitatore/proprietario
 * Sprint 1: Stats drawer non implementato, Messaggio gestisce caso senza contatti
 */
export function ProfileCTABar({
  isOwner,
  isFollowing = false,
  onFollowToggle,
  userSlug,
  whatsappNumber,
  telegramHandle,
}: ProfileCTABarProps) {
  const [showContactMenu, setShowContactMenu] = useState(false);
  
  const hasContacts = Boolean(whatsappNumber || telegramHandle);

  if (isOwner) {
    // Owner mode
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <Button asChild variant="default" className="flex-1">
          <Link href="/dashboard/settings">
            <Edit2 className="w-4 h-4 mr-2" />
            Modifica Profilo
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Share2 className="w-4 h-4 mr-2" />
              Condividi Profilo
            </DropdownMenuItem>
            <DropdownMenuItem>
              <QrCode className="w-4 h-4 mr-2" />
              QR Code Personale
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground">
              Impostazioni Privacy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Visitatore mode
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <Button
        variant={isFollowing ? 'outline' : 'default'}
        className="flex-1"
        onClick={onFollowToggle}
      >
        <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
        {isFollowing ? 'Seguendo' : 'Segui'}
      </Button>

      {hasContacts ? (
        <DropdownMenu open={showContactMenu} onOpenChange={setShowContactMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1">
              <MessageCircle className="w-4 h-4 mr-2" />
              Messaggio
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            {whatsappNumber && (
              <DropdownMenuItem asChild>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </DropdownMenuItem>
            )}
            {telegramHandle && (
              <DropdownMenuItem asChild>
                <a
                  href={`https://t.me/${telegramHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Telegram
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="outline" className="flex-1" disabled>
          <MessageCircle className="w-4 h-4 mr-2" />
          <span className="text-xs">Presto disponibile</span>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Share2 className="w-4 h-4 mr-2" />
            Condividi Profilo
          </DropdownMenuItem>
          <DropdownMenuItem>
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <Flag className="w-4 h-4 mr-2" />
            Segnala
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            <Ban className="w-4 h-4 mr-2" />
            Blocca
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
