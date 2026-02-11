"use client";

import { useEffect, useState } from "react";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { TrendChart } from "@/components/analytics/TrendChart";
import { TopEventsChart } from "@/components/analytics/TopEventsChart";
import { TicketTypeChart } from "@/components/analytics/TicketTypeChart";
import { RecentActions } from "@/components/analytics/RecentActions";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Ticket,
  DollarSign,
  Users,
  RefreshCw,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface StatsData {
  summary: {
    events: number;
    tickets: number;
    revenue: number;
    checkIns: number;
  };
  trend: Array<{
    date: string;
    tickets: number;
    revenue: number;
  }>;
  topEvents: Array<{
    id: string;
    title: string;
    ticketsSold: number;
  }>;
  ticketTypeDistribution: Array<{
    type: string;
    count: number;
  }>;
}

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

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [logs, setLogs] = useState<AnalyticsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, logsRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/analytics/log?limit=10"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs);
      }
    } catch (error) {
      console.error("Errore nel caricamento dei dati:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleUpdateStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/dashboard/stats/update", {
        method: "POST",
      });

      if (res.ok) {
        await fetchData();
        alert("Statistiche aggiornate con successo!");
      } else {
        const error = await res.json();
        alert(error.error || "Errore nell'aggiornamento");
      }
    } catch (error) {
      console.error("Errore update stats:", error);
      alert("Errore nell'aggiornamento delle statistiche");
    } finally {
      setRefreshing(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <p>Errore nel caricamento delle statistiche</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Dashboard Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Panoramica completa delle performance dei tuoi eventi
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Aggiorna
          </Button>
          {(session?.user as any)?.role === "ADMIN" ? (
            <Button
              variant="default"
              size="sm"
              onClick={handleUpdateStats}
              disabled={refreshing}
            >
              Ricalcola Stats
            </Button>
          ) : null}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Eventi Creati"
          value={stats.summary.events}
          description="Totale eventi nel sistema"
          icon={Calendar}
        />
        <AnalyticsCard
          title="Biglietti Venduti"
          value={stats.summary.tickets}
          description="Totale biglietti emessi"
          icon={Ticket}
        />
        <AnalyticsCard
          title="Entrate Totali"
          value={`€${stats.summary.revenue.toFixed(2)}`}
          description="Revenue da biglietti pagati"
          icon={DollarSign}
        />
        <AnalyticsCard
          title="Check-in Effettuati"
          value={stats.summary.checkIns}
          description="Totale accessi confermati"
          icon={Users}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-1">
        <TrendChart data={stats.trend} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopEventsChart data={stats.topEvents} />
        <TicketTypeChart data={stats.ticketTypeDistribution} />
      </div>

      {/* Recent Actions */}
      <RecentActions logs={logs} />
    </div>
  );
}
