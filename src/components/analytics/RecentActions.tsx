"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface AnalyticsLog {
  id: string;
  actionType: string;
  targetId: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  } | null;
  meta: any;
}

interface RecentActionsProps {
  logs: AnalyticsLog[];
}

const ACTION_LABELS: Record<string, string> = {
  QR_GENERATED: "🎫 QR Generato",
  CHECKIN: "✅ Check-in",
  PURCHASE: "💳 Acquisto",
  FOLLOW: "👥 Follow",
  EVENT_CREATED: "🎉 Evento Creato",
  EVENT_PUBLISHED: "📢 Evento Pubblicato",
  TICKET_REGISTERED: "🎟️ Biglietto Registrato",
  PAYMENT_COMPLETED: "💰 Pagamento Completato",
};

const ACTION_COLORS: Record<string, string> = {
  QR_GENERATED: "text-blue-600",
  CHECKIN: "text-green-600",
  PURCHASE: "text-purple-600",
  FOLLOW: "text-pink-600",
  EVENT_CREATED: "text-orange-600",
  EVENT_PUBLISHED: "text-indigo-600",
  TICKET_REGISTERED: "text-cyan-600",
  PAYMENT_COMPLETED: "text-emerald-600",
};

export function RecentActions({ logs }: RecentActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>📋 Azioni Recenti</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nessuna azione registrata
              </p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 rounded-lg border"
                >
                  <div className="flex-1">
                    <div
                      className={`font-medium text-sm ${
                        ACTION_COLORS[log.actionType] || "text-gray-600"
                      }`}
                    >
                      {ACTION_LABELS[log.actionType] || log.actionType}
                    </div>
                    {log.user && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {log.user.name || log.user.email}
                      </div>
                    )}
                    {log.meta && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {JSON.stringify(log.meta).substring(0, 50)}...
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                      locale: it,
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
