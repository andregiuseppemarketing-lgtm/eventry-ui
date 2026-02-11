'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, TrendingUp } from 'lucide-react';

interface PrPerformanceTableProps {
  title: string;
  description?: string;
  data: {
    prName: string;
    prInstagram: string | null;
    entries: number;
    revenue: number;
    avgGroupSize: number;
    tickets: {
      lista: number;
      tavolo: number;
      prevendita: number;
      omaggio: number;
    };
  }[];
  totalEntries: number;
}

export function PrPerformanceTable({
  title,
  description,
  data,
  totalEntries,
}: PrPerformanceTableProps) {
  return (
    <Card className="glass border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-sm text-muted-foreground">
                <th className="text-left py-3 px-2">#</th>
                <th className="text-left py-3 px-2">PR</th>
                <th className="text-right py-3 px-2">Ingressi</th>
                <th className="text-right py-3 px-2">%</th>
                <th className="text-right py-3 px-2">Incasso</th>
                <th className="text-right py-3 px-2">Gruppo Medio</th>
                <th className="text-left py-3 px-2">Tipologie</th>
              </tr>
            </thead>
            <tbody>
              {data.map((pr, index) => {
                const percentage = totalEntries > 0
                  ? ((pr.entries / totalEntries) * 100).toFixed(1)
                  : '0';

                return (
                  <tr
                    key={index}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    {/* Rank */}
                    <td className="py-3 px-2">
                      {index === 0 ? (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {index + 1}
                        </span>
                      )}
                    </td>

                    {/* Nome PR */}
                    <td className="py-3 px-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{pr.prName}</span>
                        {pr.prInstagram && (
                          <a
                            href={`https://instagram.com/${pr.prInstagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            {pr.prInstagram}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Ingressi */}
                    <td className="text-right py-3 px-2">
                      <span className="font-semibold">{pr.entries}</span>
                    </td>

                    {/* Percentuale */}
                    <td className="text-right py-3 px-2">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">
                          {percentage}%
                        </span>
                      </div>
                    </td>

                    {/* Incasso */}
                    <td className="text-right py-3 px-2">
                      <span className="text-sm font-medium text-green-500">
                        €{pr.revenue.toFixed(0)}
                      </span>
                    </td>

                    {/* Gruppo medio */}
                    <td className="text-right py-3 px-2">
                      <span className="text-sm text-muted-foreground">
                        {pr.avgGroupSize.toFixed(1)}
                      </span>
                    </td>

                    {/* Tipologie ticket */}
                    <td className="py-3 px-2">
                      <div className="flex gap-1 flex-wrap">
                        {pr.tickets.lista > 0 && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                            L:{pr.tickets.lista}
                          </span>
                        )}
                        {pr.tickets.tavolo > 0 && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                            T:{pr.tickets.tavolo}
                          </span>
                        )}
                        {pr.tickets.prevendita > 0 && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            P:{pr.tickets.prevendita}
                          </span>
                        )}
                        {pr.tickets.omaggio > 0 && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                            O:{pr.tickets.omaggio}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {data.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nessun dato PR disponibile
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
