'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TimelineChartProps {
  title: string;
  description?: string;
  data: { time: string; entries: number; cumulative?: number }[];
  showCumulative?: boolean;
}

export function TimelineChart({
  title,
  description,
  data,
  showCumulative = false,
}: TimelineChartProps) {
  // Trova valore massimo per scala
  const maxEntries = Math.max(...data.map(d => d.entries), 1);
  const maxCumulative = showCumulative
    ? Math.max(...data.map(d => d.cumulative || 0), 1)
    : 0;

  return (
    <Card className="glass border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Legenda */}
          <div className="flex gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded" />
              <span>Ingressi per fascia</span>
            </div>
            {showCumulative && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded" />
                <span>Ingressi cumulati</span>
              </div>
            )}
          </div>

          {/* Grafico */}
          <div className="space-y-1.5">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                {/* Time label */}
                <div className="text-xs text-muted-foreground w-12 text-right">
                  {item.time}
                </div>

                {/* Bar per ingressi */}
                <div className="flex-1 flex items-center gap-2">
                  <div className="relative flex-1 h-8 bg-muted/20 rounded overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-primary/80 transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${(item.entries / maxEntries) * 100}%` }}
                    >
                      {item.entries > 0 && (
                        <span className="text-xs font-medium text-primary-foreground">
                          {item.entries}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bar cumulative */}
                  {showCumulative && item.cumulative !== undefined && (
                    <div className="relative w-24 h-8 bg-muted/20 rounded overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-green-500/80 transition-all duration-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${(item.cumulative / maxCumulative) * 100}%`,
                        }}
                      >
                        <span className="text-xs font-medium text-white">
                          {item.cumulative}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stats summary */}
          <div className="flex gap-4 pt-4 border-t border-border text-sm">
            <div>
              <span className="text-muted-foreground">Totale ingressi: </span>
              <span className="font-semibold">
                {data.reduce((sum, d) => sum + d.entries, 0)}
              </span>
            </div>
            {showCumulative && data[data.length - 1]?.cumulative && (
              <div>
                <span className="text-muted-foreground">Picco: </span>
                <span className="font-semibold">
                  {Math.max(...data.map(d => d.entries))} ingressi/slot
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
