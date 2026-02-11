'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro, Wine, TrendingUp, ShoppingBag, Calendar } from 'lucide-react';

interface Props {
  guestId: string;
}

export function ClientSpendingHistory({ guestId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['guest-consumptions', guestId],
    queryFn: async () => {
      const res = await fetch(`/api/guests/${guestId}/consumptions`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="glass border border-border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Euro className="w-5 h-5 text-green-400" />
            Storico Spesa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground animate-pulse">
            Caricamento...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.consumptions.length === 0) {
    return (
      <Card className="glass border border-border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Euro className="w-5 h-5 text-green-400" />
            Storico Spesa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nessuna consumazione registrata</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { stats, byCategory, timeline } = data;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'drink':
      case 'bottle':
        return Wine;
      case 'food':
        return ShoppingBag;
      default:
        return ShoppingBag;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border border-green-500/20 bg-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Euro className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lifetime Value</p>
                <p className="text-xl font-bold text-green-400">
                  €{stats.lifetimeValue.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ordini Totali</p>
                <p className="text-xl font-bold text-foreground">
                  {stats.totalOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ordine Medio</p>
                <p className="text-xl font-bold text-foreground">
                  €{stats.avgOrderValue.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Wine className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Preferenza</p>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {stats.favoriteCategory || 'N/D'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By Category */}
      <Card className="glass border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Consumazioni per Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(byCategory).map(([category, data]: [string, any]) => {
              const Icon = getCategoryIcon(category);
              const percentage = ((data.revenue / stats.totalSpent) * 100).toFixed(1);
              
              return (
                <div key={category} className="flex items-center gap-4">
                  <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{category}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.count} ordini • €{data.revenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-muted/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timeline by Event */}
      <Card className="glass border border-border">
        <CardHeader>
          <CardTitle className="text-lg">Timeline per Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timeline.map((event: any) => {
              const totalEventValue = event.ticketPrice + event.spent;
              
              return (
                <div key={event.eventId} className="p-4 rounded-lg border border-border bg-muted/5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{event.eventTitle}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.eventDate).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-400">
                        €{totalEventValue.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">totale</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Biglietto</p>
                      <p className="text-sm font-medium">€{event.ticketPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Consumazioni</p>
                      <p className="text-sm font-medium">
                        €{event.spent.toFixed(2)} <span className="text-xs text-muted-foreground">({event.consumptions})</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
