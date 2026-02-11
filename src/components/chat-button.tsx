'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface ChatButtonProps {
  whatsappNumber?: string | null;
  telegramHandle?: string | null;
  className?: string;
}

/**
 * Chat button component that opens WhatsApp or Telegram
 * Priority: WhatsApp > Telegram
 */
export function ChatButton({ whatsappNumber, telegramHandle, className }: ChatButtonProps) {
  const handleClick = () => {
    if (whatsappNumber) {
      // Format WhatsApp number (remove spaces, +, etc.)
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      // Open WhatsApp
      window.open(`https://wa.me/${cleanNumber}`, '_blank');
    } else if (telegramHandle) {
      // Remove @ if present
      const cleanHandle = telegramHandle.replace('@', '');
      // Open Telegram
      window.open(`https://t.me/${cleanHandle}`, '_blank');
    }
  };

  // Don't render if no contact method available
  if (!whatsappNumber && !telegramHandle) {
    return null;
  }

  const platform = whatsappNumber ? 'WhatsApp' : 'Telegram';

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size="lg"
      className={className}
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      Chatta su {platform}
    </Button>
  );
}
