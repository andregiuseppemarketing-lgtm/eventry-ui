'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PieChartProps {
  title: string;
  description?: string;
  data: { label: string; value: number; color?: string }[];
  showPercentages?: boolean;
}

const DEFAULT_COLORS = [
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // green
  '#3b82f6', // blue
  '#6366f1', // indigo
];

export function PieChart({
  title,
  description,
  data,
  showPercentages = true,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calcola percentuali e colori
  const segments = data.map((item, index) => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  // Ordina per valore decrescente
  const sortedSegments = [...segments].sort((a, b) => b.value - a.value);

  return (
    <Card className="glass border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Simple Pie SVG */}
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {(() => {
                let currentAngle = 0;
                return sortedSegments.map((segment, index) => {
                  const angle = (segment.percentage / 100) * 360;
                  const startAngle = currentAngle;
                  currentAngle += angle;

                  // Converti angoli in radianti
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (currentAngle * Math.PI) / 180;

                  // Calcola punti arco
                  const x1 = 50 + 40 * Math.cos(startRad);
                  const y1 = 50 + 40 * Math.sin(startRad);
                  const x2 = 50 + 40 * Math.cos(endRad);
                  const y2 = 50 + 40 * Math.sin(endRad);

                  const largeArc = angle > 180 ? 1 : 0;

                  return (
                    <path
                      key={index}
                      d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={segment.color}
                      opacity="0.9"
                      className="transition-opacity hover:opacity-100"
                    />
                  );
                });
              })()}
              {/* Centro bianco */}
              <circle cx="50" cy="50" r="20" fill="hsl(var(--background))" />
            </svg>

            {/* Totale al centro */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold gradient-text">{total}</span>
              <span className="text-xs text-muted-foreground">totale</span>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex-1 space-y-2">
            {sortedSegments.map((segment, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 p-2 rounded hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm font-medium">{segment.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{segment.value}</span>
                  {showPercentages && (
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {segment.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
