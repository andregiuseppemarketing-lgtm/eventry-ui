import { Badge } from '@/components/ui/badge';
import { Gift, CreditCard, CheckCircle, XCircle } from 'lucide-react';

export type TicketBadgeType = 
  | 'complimentary' // Omaggio - verde
  | 'paid'          // Pagato - blu
  | 'unpaid'        // Da pagare - arancione
  | 'used'          // Già usato - rosso
  | 'cancelled';    // Annullato - grigio

interface TicketBadgeProps {
  type: TicketBadgeType;
  price?: number;
  currency?: string;
  className?: string;
}

export function TicketBadge({ type, price, currency = 'EUR', className }: TicketBadgeProps) {
  const configs = {
    complimentary: {
      icon: Gift,
      label: 'OMAGGIO',
      variant: 'default' as const,
      className: 'bg-green-500 hover:bg-green-600 text-white',
    },
    paid: {
      icon: CheckCircle,
      label: 'PAGATO',
      variant: 'default' as const,
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    unpaid: {
      icon: CreditCard,
      label: `DA PAGARE: ${currency === 'EUR' ? '€' : currency}${price?.toFixed(2) || '0.00'}`,
      variant: 'default' as const,
      className: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
    used: {
      icon: XCircle,
      label: 'GIÀ USATO',
      variant: 'destructive' as const,
      className: '',
    },
    cancelled: {
      icon: XCircle,
      label: 'ANNULLATO',
      variant: 'secondary' as const,
      className: '',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ''}`}>
      <Icon className="w-4 h-4 mr-1" />
      {config.label}
    </Badge>
  );
}
