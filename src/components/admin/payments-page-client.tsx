'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, DollarSign, TrendingUp, Settings } from 'lucide-react';

/**
 * PAYMENTS FOUNDATION: Admin Payments Placeholder
 * 
 * This page is a placeholder for future payment management features.
 * 
 * When NEXT_PUBLIC_PAYMENTS_ENABLED is activated, this page will show:
 * - Transaction history
 * - Payout management
 * - Fee distribution (Eventry + SIAE + Organizer/Venue)
 * - Revenue analytics
 * - Refund processing
 */
export function AdminPaymentsClient() {
  const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestione Pagamenti</h1>
        </div>
        <p className="text-muted-foreground">
          Sistema di pagamenti e distribuzione fee per eventi
        </p>
      </div>

      {/* Status Alert */}
      <Alert className="mb-6 border-yellow-200 bg-yellow-50">
        <Info className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Funzionalità in Sviluppo</AlertTitle>
        <AlertDescription className="text-yellow-700">
          {paymentsEnabled
            ? 'I pagamenti sono abilitati ma il pannello admin è ancora in fase di implementazione.'
            : 'I pagamenti online sono attualmente disabilitati. Tutti i pagamenti avvengono alla cassa.'}
        </AlertDescription>
      </Alert>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Transazioni
            </CardTitle>
            <CardDescription>
              Storico completo di tutti i pagamenti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-gray-100">
              Coming Soon
            </Badge>
          </CardContent>
        </Card>

        {/* Fee Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Distribuzione Fee
            </CardTitle>
            <CardDescription>
              Split automatico: Eventry + SIAE + Organizer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-gray-100">
              Coming Soon
            </Badge>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Configurazione
            </CardTitle>
            <CardDescription>
              Impostazioni provider e payout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-gray-100">
              Coming Soon
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Note */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Note Architetturali</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2 text-sm">
          <p><strong>Payout Model Futuro:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Ticket Ingresso:</strong> Quota Eventry + Quota SIAE + Quota Organizzatore/Locale</li>
            <li><strong>Ticket Drink:</strong> Quota Eventry + Quota Organizzatore/Locale</li>
            <li><strong>Payment Methods:</strong> CASH, CARD_DOOR, SATISPAY, STRIPE</li>
            <li><strong>Payment Status:</strong> UNPAID → PAID_DOOR | PAID_ONLINE</li>
          </ul>
          <p className="mt-4"><strong>Prisma Schema Ready:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><code>paymentStatus: PaymentStatus</code> (8 stati)</li>
            <li><code>paymentMethod: PaymentMethod</code> (6 metodi)</li>
            <li><code>paymentIntentId: String?</code> (Stripe future)</li>
            <li><code>paymentRequired: Boolean</code> (flag per controllo)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Current Flow Note */}
      <Alert className="mt-6 border-green-200 bg-green-50">
        <Info className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Flusso Attuale Attivo</AlertTitle>
        <AlertDescription className="text-green-700">
          <p className="mb-2">Il sistema di pagamento alla cassa è già operativo:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong>Door Payment API:</strong> <code>POST /api/tickets/[code]/mark-paid</code></li>
            <li><strong>Check-in Staff:</strong> Può marcare ticket come pagato (CASH, CARD_DOOR, SATISPAY)</li>
            <li><strong>Ticket State Machine:</strong> Gestisce transizioni UNPAID → PAID_DOOR</li>
            <li><strong>Checkin Page:</strong> Supporta payment capture durante check-in</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
