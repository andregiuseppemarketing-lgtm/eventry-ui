import { mockStats } from '@/data/mock-stats';
import { StatCard } from '@/components/ui/StatCard';

export default function DashboardPage() {
  const stats = mockStats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Panoramica generale della piattaforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Eventi Totali"
          value={stats.totalEvents}
          subtitle="↑ 12% vs mese scorso"
          trend="up"
        />
        <StatCard
          title="Biglietti Venduti"
          value={stats.totalTicketsSold.toLocaleString()}
          subtitle="↑ 8% vs mese scorso"
          trend="up"
        />
        <StatCard
          title="Ricavi Totali"
          value={`€${stats.totalRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
          subtitle="↑ 15% vs mese scorso"
          trend="up"
        />
        <StatCard
          title="Utenti Attivi"
          value={stats.activeUsers.toLocaleString()}
          subtitle="↑ 23% vs mese scorso"
          trend="up"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Attività Recente</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl">🎫</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Nuova vendita - Summer Music Festival</div>
              <div className="text-sm text-gray-600">2 minuti fa</div>
            </div>
            <div className="text-green-600 font-semibold">+€45.00</div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl">✨</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Nuovo evento creato - Notte Bianca</div>
              <div className="text-sm text-gray-600">1 ora fa</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl">👤</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Nuovo utente registrato</div>
              <div className="text-sm text-gray-600">2 ore fa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
